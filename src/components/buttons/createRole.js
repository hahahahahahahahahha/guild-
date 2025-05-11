import { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'create_role';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create the modal
  const modal = new ModalBuilder()
    .setCustomId('create_role_modal')
    .setTitle('Create New Role');

  // Add inputs to the modal
  const nameInput = new TextInputBuilder()
    .setCustomId('role_name')
    .setLabel('Role Name')
    .setPlaceholder('Enter the name for the new role')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const colorInput = new TextInputBuilder()
    .setCustomId('role_color')
    .setLabel('Role Color (Hex code)')
    .setPlaceholder('e.g., #FF0000 for red')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  const positionInput = new TextInputBuilder()
    .setCustomId('role_position')
    .setLabel('Position (number)')
    .setPlaceholder('Leave blank for default position')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  // Add inputs to action rows
  const nameRow = new ActionRowBuilder().addComponents(nameInput);
  const colorRow = new ActionRowBuilder().addComponents(colorInput);
  const positionRow = new ActionRowBuilder().addComponents(positionInput);

  // Add action rows to the modal
  modal.addComponents(nameRow, colorRow, positionRow);

  // Show the modal
  await interaction.showModal(modal);
}