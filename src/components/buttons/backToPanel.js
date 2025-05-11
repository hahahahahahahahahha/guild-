import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { createPanelEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'back_to_panel';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create the panel embed
  const embed = createPanelEmbed(
    'Guild Management Panel',
    '> Select a management option below to get started.\n\n' +
    '**Role Management**\n' +
    '• Create, delete, and move roles\n' +
    '• Manage role permissions\n\n' +
    '**Channel Management**\n' +
    '• Create, delete, and move channels\n' +
    '• Manage channel settings'
  );

  // Create the select menu for choosing management type
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('panel_select')
    .setPlaceholder('Select management type')
    .addOptions([
      {
        label: 'Role Management',
        description: 'Manage server roles',
        value: 'role_management',
        emoji: '👑'
      },
      {
        label: 'Channel Management',
        description: 'Manage server channels',
        value: 'channel_management',
        emoji: '📝'
      }
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  // Update the message with the main panel
  await interaction.update({
    embeds: [embed],
    components: [row]
  });
}