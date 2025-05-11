import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createLoadingEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'confirm_reset_role_permissions';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the role ID from the custom ID
  const roleId = interaction.customId.split(':')[1];
  
  // Send a loading message
  await interaction.update({
    embeds: [createLoadingEmbed('Сброс прав роли...')],
    components: [],
    ephemeral: true
  });
  
  try {
    // Fetch the role
    const role = await interaction.guild.roles.fetch(roleId);
    
    if (!role) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Ошибка', 'Выбранная роль не найдена. Возможно, она была удалена.')],
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('view_roles')
                .setLabel('Назад к списку ролей')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('◀️')
            )
        ],
        ephemeral: true
      });
    }
    
    // Reset the role permissions to default (0n)
    await role.setPermissions(0n, `Сброс прав администратором ${interaction.user.tag}`);
    
    // Create a success embed
    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Права роли сброшены')
      .setColor('#2ecc71')
      .setDescription(`Все права роли **${role.name}** успешно сброшены до значений по умолчанию.`)
      .setTimestamp();
    
    // Create buttons for further actions
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manage_role_permissions:${roleId}`)
          .setLabel('Вернуться к управлению правами')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔒')
      );
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manage_role:${roleId}`)
          .setLabel('Вернуться к управлению ролью')
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
    console.error('Error in confirmResetRolePermissions:', error);
    
    // Create an error embed
    const errorEmbed = createErrorEmbed(
      'Ошибка при сбросе прав роли',
      `Произошла ошибка: ${error.message}\n` +
      'Убедитесь, что у бота есть необходимые права и попробуйте снова.'
    );
    
    // Create a button to go back to role management
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manage_role_permissions:${roleId}`)
          .setLabel('Назад к управлению правами')
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