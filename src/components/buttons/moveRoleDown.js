import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed, createLoadingEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'move_role_down';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the role ID from the custom ID
  const roleId = interaction.customId.split(':')[1];

  // Determine if this is a direct interaction or from the manage role interface
  const isFromManageRole = interaction.message.components.some(row => 
    row.components.some(component => component.customId === `manage_role:${roleId}`)
  );

  try {
    // Get the role
    const role = await interaction.guild.roles.fetch(roleId);
    
    if (!role) {
      // Role not found
      const errorEmbed = createErrorEmbed(
        'Роль не найдена',
        'Выбранная роль не найдена. Возможно, она была удалена.'
      );

      await interaction.reply({
        embeds: [errorEmbed],
        components: [],
        ephemeral: true
      });
      return;
    }

    // Create loading embed
    const loadingEmbed = createLoadingEmbed('Перемещение роли вниз...');

    // Send loading message
    await interaction.reply({
      embeds: [loadingEmbed],
      ephemeral: true
    });

    // Check if the role is already at the lowest possible position
    if (role.position <= 1) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Невозможно переместить роль',
          'Эта роль уже находится на минимально возможной позиции.'
        )],
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(isFromManageRole ? `manage_role:${roleId}` : 'back_to_panel')
                .setLabel(isFromManageRole ? 'Вернуться к управлению ролью' : 'Назад в главное меню')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('◀️')
            )
        ],
        ephemeral: true
      });
    }
    
    // Get all roles and sort them by position
    const allRoles = await interaction.guild.roles.fetch();
    const sortedRoles = [...allRoles.values()].sort((a, b) => a.position - b.position);
    
    // Find the role's current position in the sorted array
    const currentIndex = sortedRoles.findIndex(r => r.id === role.id);
    
    // Find the next role below this one that the bot can move
    let targetIndex = currentIndex - 1;
    while (targetIndex >= 0 && sortedRoles[targetIndex].managed) {
      targetIndex--;
    }
    
    // If we couldn't find a valid target position
    if (targetIndex < 0 || targetIndex === currentIndex) {
      return await interaction.editReply({
        embeds: [createErrorEmbed(
          'Невозможно переместить роль',
          'Нет доступных позиций ниже текущей, или все роли ниже управляются интеграциями.'
        )],
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(isFromManageRole ? `manage_role:${roleId}` : 'back_to_panel')
                .setLabel(isFromManageRole ? 'Вернуться к управлению ролью' : 'Назад в главное меню')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('◀️')
            )
        ],
        ephemeral: true
      });
    }
    
    // Get the target role
    const targetRole = sortedRoles[targetIndex];
    
    // Store the current position for the success message
    const currentPosition = role.position;
    
    // Move the role to the new position
    await role.setPosition(targetRole.position, { reason: `Перемещено администратором ${interaction.user.tag}` });
    
    // Fetch the updated role
    const updatedRole = await interaction.guild.roles.fetch(roleId);
    
    // Create a success embed
    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Роль перемещена вниз')
      .setColor(role.color || '#2ecc71')
      .setDescription(
        `Роль **${updatedRole.name}** успешно перемещена\n` +
        `Предыдущая позиция: **${currentPosition}**\n` +
        `Новая позиция: **${updatedRole.position}**`
      )
      .setTimestamp();
    
    // Create buttons for further actions
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`move_role_up:${roleId}`)
          .setLabel('Переместить вверх')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬆️'),
        new ButtonBuilder()
          .setCustomId(`move_role_down:${roleId}`)
          .setLabel('Переместить ещё ниже')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬇️')
      );
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(isFromManageRole ? `manage_role:${roleId}` : 'back_to_panel')
          .setLabel(isFromManageRole ? 'Вернуться к управлению ролью' : 'Назад в главное меню')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );
    
    // Update the reply with the success message
    await interaction.editReply({
      embeds: [successEmbed],
      components: [row1, row2],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error in moveRoleDown:', error);
    
    // Create an error embed
    const errorEmbed = createErrorEmbed(
      'Ошибка при перемещении роли',
      `Произошла ошибка: ${error.message}\n` +
      'Убедитесь, что у бота есть необходимые права и попробуйте снова.'
    );
    
    // Create back button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(isFromManageRole ? `manage_role:${roleId}` : 'back_to_panel')
          .setLabel(isFromManageRole ? 'Вернуться к управлению ролью' : 'Назад в главное меню')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );
    
    // Update the reply with the error message
    await interaction.editReply({
      embeds: [errorEmbed],
      components: [row],
      ephemeral: true
    });
  }
}