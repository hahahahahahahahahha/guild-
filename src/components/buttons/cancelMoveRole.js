import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createPanelEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'cancel_move_role';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create the panel embed
  const embed = createPanelEmbed(
    'Role Management',
    '> Select an action to manage server roles.\n\n' +
    '**Available Actions:**\n' +
    '• Create a new role\n' +
    '• Delete an existing role\n' +
    '• Move a role\'s position'
  );

  // Create buttons for role management
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_role')
        .setLabel('Create Role')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('delete_role')
        .setLabel('Delete Role')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('move_role')
        .setLabel('Move Role')
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

  // Update the message with the role management panel
  await interaction.update({
    embeds: [embed],
    components: [row1, row2]
  });
}