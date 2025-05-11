import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'bulk_channel_operations';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create the embed for bulk channel operations
  const embed = createPanelEmbed(
    'Bulk Channel Operations',
    '> Perform operations on multiple channels at once.\n\n' +
    '**Available Operations:**\n' +
    '• Create multiple channels at once\n' +
    '• Delete multiple channels at once\n' +
    '• Apply permissions to multiple channels\n' +
    '• Reorganize channel hierarchy'
  );

  // Create buttons for bulk channel operations
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bulk_create_channels')
        .setLabel('Create Multiple Channels')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('bulk_delete_channels')
        .setLabel('Delete Multiple Channels')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️')
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bulk_channel_permissions')
        .setLabel('Apply Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId('reorganize_channels')
        .setLabel('Reorganize Hierarchy')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊')
    );

  // Create a back button to return to channel management
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_channel_management')
        .setLabel('Back to Channel Management')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: [row1, row2, row3]
  });
}