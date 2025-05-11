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
      '• Move a role\'s position\n' +
      '• Manage role permissions'
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
      
    // Additional buttons
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('role_permissions')
          .setLabel('Role Permissions')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔒'),
        new ButtonBuilder()
          .setCustomId('bulk_role_operations')
          .setLabel('Bulk Operations')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⚡')
      );

    // Back button
    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_to_panel')
          .setLabel('Back to Main Panel')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );

    components = [row1, row2, row3];
  } else if (selectedValue === 'channel_management') {
    // Channel management panel
    embed = createPanelEmbed(
      'Channel Management',
      '> Select an action to manage server channels.\n\n' +
      '**Available Actions:**\n' +
      '• Create a new channel\n' +
      '• Delete an existing channel\n' +
      '• Move a channel\'s position\n' +
      '• Manage channel permissions'
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
      
    // Additional buttons
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('channel_permissions')
          .setLabel('Channel Permissions')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔐'),
        new ButtonBuilder()
          .setCustomId('bulk_channel_operations')
          .setLabel('Bulk Operations')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⚡')
      );

    // Back button
    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_to_panel')
          .setLabel('Back to Main Panel')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );

    components = [row1, row2, row3];
  } else if (selectedValue === 'role_permissions') {
    // Role permissions panel
    embed = createPanelEmbed(
      'Role Permissions Management',
      '> Select a role to manage its permissions.\n\n' +
      'You can set specific permissions for each role in the server.'
    );

    // Create button for role permissions
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('role_permissions')
          .setLabel('Manage Role Permissions')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔒')
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
  } else if (selectedValue === 'channel_permissions') {
    // Channel permissions panel
    embed = createPanelEmbed(
      'Channel Permissions Management',
      '> Select a channel to manage its permissions.\n\n' +
      'You can set specific permissions for roles and members in each channel.'
    );

    // Create button for channel permissions
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('channel_permissions')
          .setLabel('Manage Channel Permissions')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔐')
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
  } else if (selectedValue === 'bulk_operations') {
    // Bulk operations panel
    embed = createPanelEmbed(
      'Bulk Operations',
      '> Select an operation type to perform bulk actions.\n\n' +
      '**Available Operations:**\n' +
      '• Bulk role operations (create, delete, color)\n' +
      '• Bulk channel operations (create, delete)'
    );

    // Create buttons for bulk operations
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('bulk_role_operations')
          .setLabel('Bulk Role Operations')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('👑'),
        new ButtonBuilder()
          .setCustomId('bulk_channel_operations')
          .setLabel('Bulk Channel Operations')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📝')
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