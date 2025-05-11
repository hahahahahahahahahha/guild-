import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'channel_permissions_select';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the selected channel ID
  const channelId = interaction.values[0];
  
  // Fetch the channel
  const channel = await interaction.guild.channels.fetch(channelId);
  
  if (!channel) {
    return await interaction.reply({
      content: '❌ Channel not found. It may have been deleted.',
      ephemeral: true
    });
  }

  // Get all roles from the guild
  const roles = await interaction.guild.roles.fetch();
  
  // Create the embed
  const embed = createPanelEmbed(
    `Channel Permissions: ${channel.name}`,
    `> Manage permissions for the **${channel.name}** channel.\n\n` +
    `**Channel Type:** ${channel.type === 4 ? 'Category' : channel.type === 0 ? 'Text' : channel.type === 2 ? 'Voice' : channel.type === 5 ? 'Announcement' : channel.type === 15 ? 'Forum' : channel.type === 13 ? 'Stage' : 'Other'}\n\n` +
    `Select a role to manage its permissions in this channel, or use the buttons below to manage member-specific permissions.`
  );

  // Create a select menu with available roles
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`channel_role_permissions_select:${channelId}`)
    .setPlaceholder('Select a role');

  // Add options for each role
  const roleOptions = roles
    .sort((a, b) => b.position - a.position) // Sort by position (highest first)
    .map(role => ({
      label: role.name,
      description: role.id === interaction.guild.id ? 'Default role (@everyone)' : `Position: ${role.position}`,
      value: role.id,
      emoji: '🔒'
    }));

  // Add options to the select menu (max 25 options)
  const maxOptions = Math.min(25, roleOptions.length);
  selectMenu.addOptions(roleOptions.slice(0, maxOptions));

  // Create the action row with the select menu
  const row = new ActionRowBuilder().addComponents(selectMenu);

  // Create buttons for additional actions
  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`add_member_permission:${channelId}`)
        .setLabel('Add Member Permission')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👤'),
      new ButtonBuilder()
        .setCustomId(`view_channel_permissions:${channelId}`)
        .setLabel('View All Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId(`sync_permissions:${channelId}`)
        .setLabel('Sync with Category')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔄')
    );

  // Create a back button
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('channel_permissions')
        .setLabel('Back to Channel Selection')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: [row, row2, row3]
  });
}