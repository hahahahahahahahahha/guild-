import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createLoadingEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'toggle_admin_permission';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the role ID from the custom ID
  const roleId = interaction.customId.split(':')[1];
  
  // Send a loading message
  await interaction.deferUpdate();
  
  try {
    // Fetch the role
    const role = await interaction.guild.roles.fetch(roleId);
    
    if (!role) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Ошибка', 'Выбранная роль не найдена. Возможно, она была удалена.')],
        components: [],
        ephemeral: true
      });
    }
    
    // Check if the role currently has administrator permission
    const hasAdminPermission = role.permissions.has(PermissionsBitField.Flags.Administrator);
    
    // Toggle the administrator permission
    let newPermissions;
    if (hasAdminPermission) {
      // Remove the administrator permission
      newPermissions = role.permissions.remove(PermissionsBitField.Flags.Administrator);
    } else {
      // Add the administrator permission
      newPermissions = role.permissions.add(PermissionsBitField.Flags.Administrator);
    }
    
    // Update the role permissions
    await role.setPermissions(newPermissions, `Изменено администратором ${interaction.user.tag}`);
    
    // Create an embed with role permissions information
    const embed = new EmbedBuilder()
      .setTitle(`🔒 Управление правами роли: ${role.name}`)
      .setColor(role.color || '#3498db')
      .setDescription(
        `Выберите категорию прав для роли **${role.name}**\n\n` +
        `Право **Администратор** ${hasAdminPermission ? 'отключено' : 'включено'}.`
      )
      .addFields(
        { name: 'Текущие права', value: 
          !hasAdminPermission && role.permissions.has(PermissionsBitField.Flags.Administrator) ? 
            '**Администратор** (все права включены)' : 
            Object.keys(PermissionsBitField.Flags)
              .filter(perm => role.permissions.has(PermissionsBitField.Flags[perm]))
              .map(perm => `• ${perm}`)
              .join('\n') || 'Нет прав'
        }
      )
      .setTimestamp();
    
    // Create a select menu for permission categories
    const selectRow = new ActionRowBuilder().addComponents(
      interaction.message.components[0].components[0]
    );
    
    // Create buttons for quick actions
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`reset_role_permissions:${roleId}`)
          .setLabel('Сбросить все права')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔄'),
        new ButtonBuilder()
          .setCustomId(`toggle_admin_permission:${roleId}`)
          .setLabel(!hasAdminPermission ? 'Отключить права администратора' : 'Включить права администратора')
          .setStyle(!hasAdminPermission ? ButtonStyle.Danger : ButtonStyle.Success)
          .setEmoji('⚡')
      );
    
    // Create a back button to return to role management
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manage_role:${roleId}`)
          .setLabel('Назад к управлению ролью')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );
    
    // Update the message with the new embed and components
    await interaction.editReply({
      embeds: [embed],
      components: [selectRow, row1, row2],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error in toggleAdminPermission:', error);
    
    // Create an error embed
    const errorEmbed = createErrorEmbed(
      'Ошибка при изменении прав администратора',
      `Произошла ошибка: ${error.message}\n` +
      'Убедитесь, что у бота есть необходимые права и попробуйте снова.'
    );
    
    // Update the reply with the error message
    await interaction.editReply({
      embeds: [errorEmbed],
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`manage_role_permissions:${roleId}`)
              .setLabel('Назад к управлению правами')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('◀️')
          )
      ],
      ephemeral: true
    });
  }
}