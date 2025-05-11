import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createPanelEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'panel_select';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  const selectedValue = interaction.values[0];
  let embed, components = [];

  if (selectedValue === 'role_management') {
    // Role management panel
    embed = createPanelEmbed(
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

    components = [row1, row2];
  } else if (selectedValue === 'channel_management') {
    // Channel management panel
    embed = createPanelEmbed(
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

    components = [row1, row2];
  }

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: components
  });
}