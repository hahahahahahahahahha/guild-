import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'bulk_create_channels';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create a modal for bulk channel creation
  const modal = new ModalBuilder()
    .setCustomId('bulk_create_channels_modal')
    .setTitle('Create Multiple Channels');

  // Create text inputs for the modal
  const channelNamesInput = new TextInputBuilder()
    .setCustomId('channel_names')
    .setLabel('Channel Names (one per line)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Enter channel names, one per line\nExample:\ngeneral\nannouncements\nhelp')
    .setRequired(true)
    .setMaxLength(1000);

  const channelTypeInput = new TextInputBuilder()
    .setCustomId('channel_type')
    .setLabel('Channel Type')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('text, voice, category, forum, or announcement')
    .setRequired(true)
    .setMaxLength(20);

  const categoryIdInput = new TextInputBuilder()
    .setCustomId('category_id')
    .setLabel('Category ID (optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('ID of the category to place channels in')
    .setRequired(false)
    .setMaxLength(20);

  // Add inputs to action rows
  const firstActionRow = new ActionRowBuilder().addComponents(channelNamesInput);
  const secondActionRow = new ActionRowBuilder().addComponents(channelTypeInput);
  const thirdActionRow = new ActionRowBuilder().addComponents(categoryIdInput);

  // Add action rows to the modal
  modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

  // Show the modal to the user
  await interaction.showModal(modal);
}