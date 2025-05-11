import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'back_to_channel_management';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create the embed for channel management
  const embed = createPanelEmbed(
    'Channel Management',
    '> Select an action to manage channels on this server.\n\n' +
    '**Available Actions:**\n' +
    '• Create a new channel with custom name, type, and category\n' +
    '• Delete an existing channel\n' +
    '• Move a channel up or down in the list\n' +
    '• Bulk channel operations\n' +
    '• Manage channel permissions'
  );

  // Create buttons for channel management
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_channel')
        .setLabel('Create Channel')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('delete_channel')
        .setLabel('Delete Channel')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('move_channel')
        .setLabel('Move Channel')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('↕️')
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bulk_create_channels')
        .setLabel('Bulk Create')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('bulk_delete_channels')
        .setLabel('Bulk Delete')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('channel_permissions')
        .setLabel('Manage Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔒')
    );

  // Create a back button to return to the main panel
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_panel')
        .setLabel('Back to Main Panel')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: [row1, row2, row3]
  });
}