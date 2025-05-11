import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'bulk_color_roles_select';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the selected role IDs
  const selectedRoleIds = interaction.values;
  
  // Create a modal for entering the color
  const modal = new ModalBuilder()
    .setCustomId(`bulk_color_roles_modal:${selectedRoleIds.join(',')}`)
    .setTitle(`Color ${selectedRoleIds.length} Roles`);

  // Create a text input for the color
  const colorInput = new TextInputBuilder()
    .setCustomId('role_color')
    .setLabel('Role Color (hex code)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Example: #FF0000 for red')
    .setRequired(true)
    .setMaxLength(7);

  // Add the input to an action row
  const actionRow = new ActionRowBuilder().addComponents(colorInput);

  // Add the action row to the modal
  modal.addComponents(actionRow);

  // Show the modal to the user
  await interaction.showModal(modal);
}