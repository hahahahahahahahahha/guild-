import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'reset_role_permissions';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  try {
    // Get the role ID from the custom ID
    const roleId = interaction.customId.split(':')[1];
    
    // Fetch the role
    const role = await interaction.guild.roles.fetch(roleId);
    
    if (!role) {
      return await interaction.update({
        embeds: [createErrorEmbed('Ошибка', 'Выбранная роль не найдена. Возможно, она была удалена.')],
        components: [],
        ephemeral: true
      });
    }
    
    // Create a confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setTitle('⚠️ Подтверждение сброса прав')
      .setColor('#e74c3c')
      .setDescription(
        `Вы уверены, что хотите сбросить **ВСЕ** права роли **${role.name}**?\n\n` +
        `Это действие удалит все текущие права роли и установит значения по умолчанию.\n\n` +
        `**Это действие необратимо!**`
      )
      .setTimestamp();
    
    // Create confirmation buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_reset_role_permissions:${roleId}`)
          .setLabel('Подтвердить сброс')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('⚠️'),
        new ButtonBuilder()
          .setCustomId(`manage_role_permissions:${roleId}`)
          .setLabel('Отмена')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✖️')
      );
    
    // Update the message with the confirmation
    await interaction.update({
      embeds: [confirmEmbed],
      components: [row],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error in resetRolePermissions:', error);
    
    await interaction.update({
      embeds: [createErrorEmbed('Ошибка', `Произошла ошибка при подготовке к сбросу прав роли: ${error.message}`)],
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
}