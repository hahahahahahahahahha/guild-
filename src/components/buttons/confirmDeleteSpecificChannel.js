import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createLoadingEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'confirm_delete_specific_channel';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the channel ID from the custom ID
  const channelId = interaction.customId.split(':')[1];
  
  // Send a loading message
  await interaction.update({
    embeds: [createLoadingEmbed('Удаление канала...')],
    components: [],
    ephemeral: true
  });
  
  try {
    // Fetch the channel
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Ошибка', 'Выбранный канал не найден. Возможно, он был удален.')],
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
    
    // Store channel info for the success message
    const channelName = channel.name;
    const channelType = channel.type;
    
    // Delete the channel
    await channel.delete(`Удалено администратором ${interaction.user.tag}`);
    
    // Create a success embed
    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Канал удален')
      .setColor('#2ecc71')
      .setDescription(`Канал **${channelName}** успешно удален.`)
      .setTimestamp();
    
    // Create a button to go back to channel list
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('view_channels')
          .setLabel('Назад к списку каналов')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('◀️')
      );
    
    // Update the reply with the success message
    await interaction.editReply({
      embeds: [successEmbed],
      components: [row],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error in confirmDeleteSpecificChannel:', error);
    
    // Create an error embed
    const errorEmbed = createErrorEmbed(
      'Ошибка при удалении канала',
      `Произошла ошибка: ${error.message}\n` +
      'Убедитесь, что у бота есть необходимые права и попробуйте снова.'
    );
    
    // Create a button to go back to channel management
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('view_channels')
          .setLabel('Назад к списку каналов')
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