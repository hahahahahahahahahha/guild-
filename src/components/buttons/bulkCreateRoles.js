import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'bulk_create_roles';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create a modal for bulk role creation
  const modal = new ModalBuilder()
    .setCustomId('bulk_create_roles_modal')
    .setTitle('Create Multiple Roles');

  // Create text inputs for the modal
  const roleNamesInput = new TextInputBuilder()
    .setCustomId('role_names')
    .setLabel('Role Names (one per line)')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Enter role names, one per line\nExample:\nModerator\nHelper\nVIP')
    .setRequired(true)
    .setMaxLength(1000);

  const roleColorInput = new TextInputBuilder()
    .setCustomId('role_color')
    .setLabel('Role Color (hex code, optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Example: #FF0000 for red')
    .setRequired(false)
    .setMaxLength(7);

  const startPositionInput = new TextInputBuilder()
    .setCustomId('start_position')
    .setLabel('Starting Position (optional)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Position number (leave empty for default)')
    .setRequired(false)
    .setMaxLength(3);

  // Add inputs to action rows
  const firstActionRow = new ActionRowBuilder().addComponents(roleNamesInput);
  const secondActionRow = new ActionRowBuilder().addComponents(roleColorInput);
  const thirdActionRow = new ActionRowBuilder().addComponents(startPositionInput);

  // Add action rows to the modal
  modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

  // Show the modal to the user
  await interaction.showModal(modal);
}