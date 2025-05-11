import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createPanelEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'cancel_move_channel';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create the panel embed
  const embed = createPanelEmbed(
    'Channel Management',
    '> Select an action to manage server channels.\n\n' +
    '**Available Actions:**\n' +
    '• Create a new channel\n' +
    '• Delete an existing channel\n' +
    '• Move a channel\'s position'
  );

  // Create buttons for channel management
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_channel')
        .setLabel('Create Channel')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('delete_channel')
        .setLabel('Delete Channel')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('move_channel')
        .setLabel('Move Channel')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('↕️')
    );

  // Back button
  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_panel')
        .setLabel('Back to Main Panel')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the message with the channel management panel
  await interaction.update({
    embeds: [embed],
    components: [row1, row2]
  });
}