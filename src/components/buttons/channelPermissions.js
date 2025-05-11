import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'channel_permissions';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get all channels from the guild
  const channels = await interaction.guild.channels.fetch();
  
  if (channels.size === 0) {
    return await interaction.reply({
      content: '⚠️ No channels found in this server.',
      ephemeral: true
    });
  }

  // Create the embed
  const embed = createPanelEmbed(
    'Channel Permissions Management',
    '> Select a channel to manage its permissions.\n\n' +
    'You can set permissions for roles and members in the selected channel.'
  );

  // Create a select menu with available channels
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('channel_permissions_select')
    .setPlaceholder('Select a channel');

  // Add options for each channel
  const channelOptions = channels
    .sort((a, b) => {
      // Sort categories first, then by position
      if (a.type === 4 && b.type !== 4) return -1;
      if (a.type !== 4 && b.type === 4) return 1;
      return a.position - b.position;
    })
    .map(channel => {
      // Determine the emoji based on channel type
      let emoji = '📝'; // Default for text channels
      if (channel.type === 4) emoji = '📁'; // Category
      if (channel.type === 2) emoji = '🔊'; // Voice channel
      if (channel.type === 5) emoji = '📢'; // Announcement channel
      if (channel.type === 15) emoji = '📊'; // Forum channel
      if (channel.type === 13) emoji = '🎭'; // Stage channel
      
      return {
        label: channel.name,
        description: `Type: ${channel.type === 4 ? 'Category' : channel.type === 0 ? 'Text' : channel.type === 2 ? 'Voice' : channel.type === 5 ? 'Announcement' : channel.type === 15 ? 'Forum' : channel.type === 13 ? 'Stage' : 'Other'}`,
        value: channel.id,
        emoji: emoji
      };
    });

  // Add options to the select menu (max 25 options)
  const maxOptions = Math.min(25, channelOptions.length);
  selectMenu.addOptions(channelOptions.slice(0, maxOptions));

  // Create the action row with the select menu
  const row = new ActionRowBuilder().addComponents(selectMenu);

  // Create a back button
  const backRow = new ActionRowBuilder()
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
    components: [row, backRow]
  });
}