import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'delete_specific_role';

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
      .setTitle('⚠️ Подтверждение удаления роли')
      .setColor('#e74c3c')
      .setDescription(
        `Вы уверены, что хотите удалить роль **${role.name}**?\n\n` +
        `**Информация о роли:**\n` +
        `• ID: ${role.id}\n` +
        `• Позиция: ${role.position}\n` +
        `• Цвет: ${role.hexColor}\n` +
        `• Участников с ролью: ${role.members.size}\n\n` +
        `**Это действие необратимо!**`
      )
      .setTimestamp();
    
    // Create confirmation buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_delete_specific_role:${roleId}`)
          .setLabel('Подтвердить удаление')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('⚠️'),
        new ButtonBuilder()
          .setCustomId(`manage_role:${roleId}`)
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
    console.error('Error in deleteSpecificRole:', error);
    
    await interaction.update({
      embeds: [createErrorEmbed('Ошибка', `Произошла ошибка при подготовке к удалению роли: ${error.message}`)],
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