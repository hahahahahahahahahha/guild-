import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'edit_channel_name';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the channel ID from the custom ID
  const channelId = interaction.customId.split(':')[1];
  
  // Fetch the channel
  const channel = await interaction.guild.channels.fetch(channelId);
  
  if (!channel) {
    return await interaction.reply({
      content: 'Канал не найден. Возможно, он был удален.',
      ephemeral: true
    });
  }
  
  // Create a modal for editing the channel name
  const modal = new ModalBuilder()
    .setCustomId(`edit_channel_name_modal:${channelId}`)
    .setTitle(`Изменить название канала: ${channel.name}`);
  
  // Create a text input for the new channel name
  const nameInput = new TextInputBuilder()
    .setCustomId('channel_name')
    .setLabel('Новое название канала')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Введите новое название канала')
    .setValue(channel.name)
    .setRequired(true)
    .setMaxLength(100);
  
  // Add the text input to the modal
  const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
  modal.addComponents(firstActionRow);
  
  // Show the modal
  await interaction.showModal(modal);
}