import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createLoadingEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'edit_channel_name_modal';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the channel ID from the custom ID
  const channelId = interaction.customId.split(':')[1];
  
  // Get the new channel name from the modal
  const newChannelName = interaction.fields.getTextInputValue('channel_name');
  
  // Send a loading message
  await interaction.reply({
    embeds: [createLoadingEmbed('Изменение названия канала...')],
    ephemeral: true
  });
  
  try {
    // Fetch the channel
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Ошибка', 'Канал не найден. Возможно, он был удален.')],
        components: [],
        ephemeral: true
      });
    }
    
    // Store the old name for the success message
    const oldName = channel.name;
    
    // Update the channel name
    await channel.setName(newChannelName, `Изменено администратором ${interaction.user.tag}`);
    
    // Create a success embed
    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Название канала изменено')
      .setColor('#2ecc71')
      .setDescription(`Название канала успешно изменено с **${oldName}** на **${newChannelName}**`)
      .setTimestamp();
    
    // Create a button to go back to channel management
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manage_channel:${channelId}`)
          .setLabel('Вернуться к управлению каналом')
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
    console.error('Error in editChannelNameModal:', error);
    
    // Create an error embed
    const errorEmbed = createErrorEmbed(
      'Ошибка при изменении названия канала',
      `Произошла ошибка: ${error.message}`
    );
    
    // Update the reply with the error message
    await interaction.editReply({
      embeds: [errorEmbed],
      components: [],
      ephemeral: true
    });
  }
}