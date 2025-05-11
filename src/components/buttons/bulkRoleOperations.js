import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'bulk_role_operations';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create the embed for bulk role operations
  const embed = createPanelEmbed(
    'Bulk Role Operations',
    '> Perform operations on multiple roles at once.\n\n' +
    '**Available Operations:**\n' +
    '• Create multiple roles at once\n' +
    '• Delete multiple roles at once\n' +
    '• Apply permissions to multiple roles\n' +
    '• Color multiple roles at once\n' +
    '• Reorganize role hierarchy'
  );

  // Create buttons for bulk role operations
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bulk_create_roles')
        .setLabel('Create Multiple Roles')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('bulk_delete_roles')
        .setLabel('Delete Multiple Roles')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️')
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bulk_permissions')
        .setLabel('Apply Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId('bulk_color_roles')
        .setLabel('Color Roles')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎨'),
      new ButtonBuilder()
        .setCustomId('reorganize_roles')
        .setLabel('Reorganize Hierarchy')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊')
    );

  // Create a back button to return to role management
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_role_management')
        .setLabel('Back to Role Management')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: [row1, row2, row3]
  });
}