import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'add_member_permission';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract the channel ID from the custom ID
  const channelId = interaction.customId.split(':')[1];
  
  // Create a modal for entering the member ID
  const modal = new ModalBuilder()
    .setCustomId(`add_member_permission_modal:${channelId}`)
    .setTitle('Add Member Permission');

  // Create a text input for the member ID
  const memberIdInput = new TextInputBuilder()
    .setCustomId('member_id')
    .setLabel('Member ID')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Enter the ID of the member')
    .setRequired(true)
    .setMaxLength(20);

  // Add the input to an action row
  const actionRow = new ActionRowBuilder().addComponents(memberIdInput);

  // Add the action row to the modal
  modal.addComponents(actionRow);

  // Show the modal to the user
  await interaction.showModal(modal);
}