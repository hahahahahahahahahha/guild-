import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'delete_specific_channel';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  try {
    // Get the channel ID from the custom ID
    const channelId = interaction.customId.split(':')[1];
    
    // Fetch the channel
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel) {
      return await interaction.update({
        embeds: [createErrorEmbed('Ошибка', 'Выбранный канал не найден. Возможно, он был удален.')],
        components: [],
        ephemeral: true
      });
    }
    
    // Create a confirmation embed
    const confirmEmbed = new EmbedBuilder()
      .setTitle('⚠️ Подтверждение удаления канала')
      .setColor('#e74c3c')
      .setDescription(
        `Вы уверены, что хотите удалить канал **${channel.name}**?\n\n` +
        `**Информация о канале:**\n` +
        `• ID: ${channel.id}\n` +
        `• Тип: ${channel.type}\n` +
        (channel.parentId ? `• Категория: ${(await interaction.guild.channels.fetch(channel.parentId)).name}\n` : '') +
        `\n**Это действие необратимо!**`
      )
      .setTimestamp();
    
    // Create confirmation buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_delete_specific_channel:${channelId}`)
          .setLabel('Подтвердить удаление')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('⚠️'),
        new ButtonBuilder()
          .setCustomId(`manage_channel:${channelId}`)
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
    console.error('Error in deleteSpecificChannel:', error);
    
    await interaction.update({
      embeds: [createErrorEmbed('Ошибка', `Произошла ошибка при подготовке к удалению канала: ${error.message}`)],
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('view_channels')
              .setLabel('Назад к списку каналов')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('◀️')
          )
      ],
      ephemeral: true
    });
  }
}