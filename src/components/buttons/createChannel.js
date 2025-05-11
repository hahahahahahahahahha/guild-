import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'create_channel';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create the modal
  const modal = new ModalBuilder()
    .setCustomId('create_channel_modal')
    .setTitle('Create New Channel');

  // Add inputs to the modal
  const nameInput = new TextInputBuilder()
    .setCustomId('channel_name')
    .setLabel('Channel Name')
    .setPlaceholder('Enter the name for the new channel')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const typeInput = new TextInputBuilder()
    .setCustomId('channel_type')
    .setLabel('Channel Type')
    .setPlaceholder('text, voice, category, forum, announcement')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const categoryInput = new TextInputBuilder()
    .setCustomId('channel_category')
    .setLabel('Category Name (optional)')
    .setPlaceholder('Leave blank for no category')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  // Add inputs to action rows
  const nameRow = new ActionRowBuilder().addComponents(nameInput);
  const typeRow = new ActionRowBuilder().addComponents(typeInput);
  const categoryRow = new ActionRowBuilder().addComponents(categoryInput);

  // Add action rows to the modal
  modal.addComponents(nameRow, typeRow, categoryRow);

  // Show the modal
  await interaction.showModal(modal);
}