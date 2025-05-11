import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { checkAdmin } from '../utils/permissions.js';
import { createPanelEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('panel')
  .setDescription('Open the guild management panel');

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create the panel embed
  const embed = createPanelEmbed(
    'Guild Management Panel',
    '> Select a management option below to get started.\n\n' +
    '**Role Management**\n' +
    '• View, create, delete, and move roles\n' +
    '• Manage role permissions\n' +
    '• Bulk role operations\n\n' +
    '**Channel Management**\n' +
    '• View, create, delete, and move channels\n' +
    '• Manage channel permissions\n' +
    '• Bulk channel operations'
  );

  // Create the select menu for choosing management type
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('panel_select')
    .setPlaceholder('Select management type')
    .addOptions([
      {
        label: 'View Roles',
        description: 'View all server roles',
        value: 'view_roles',
        emoji: '👁️'
      },
      {
        label: 'View Channels',
        description: 'View all server channels',
        value: 'view_channels',
        emoji: '📋'
      },
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
      },
      {
        label: 'Role Permissions',
        description: 'Manage role permissions',
        value: 'role_permissions',
        emoji: '🔒'
      },
      {
        label: 'Channel Permissions',
        description: 'Manage channel permissions',
        value: 'channel_permissions',
        emoji: '🔐'
      },
      {
        label: 'Bulk Operations',
        description: 'Perform bulk operations on roles and channels',
        value: 'bulk_operations',
        emoji: '⚡'
      }
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  // Send the panel embed with the select menu
  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true
  });
}