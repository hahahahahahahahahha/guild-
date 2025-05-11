import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'bulk_delete_channels';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get all channels from the guild
  const channels = await interaction.guild.channels.fetch();
  
  // Filter out categories and system channels
  const availableChannels = channels.filter(channel => 
    channel.type !== 4 && // Filter out categories
    channel.id !== interaction.guild.systemChannelId // Filter out system channel
  );

  if (availableChannels.size === 0) {
    return await interaction.reply({
      content: '⚠️ There are no channels that can be deleted.',
      ephemeral: true
    });
  }

  // Create the embed
  const embed = createPanelEmbed(
    'Bulk Delete Channels',
    '> Select multiple channels to delete at once.\n\n' +
    '**Warning:** This action cannot be undone. Please be careful when selecting channels to delete.\n\n' +
    'You can select up to 25 channels to delete at once.'
  );

  // Create a select menu with available channels
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('bulk_delete_channels_select')
    .setPlaceholder('Select channels to delete')
    .setMinValues(1)
    .setMaxValues(Math.min(25, availableChannels.size));

  // Add options for each channel
  const channelOptions = availableChannels
    .sort((a, b) => a.position - b.position) // Sort by position
    .map(channel => {
      // Determine the emoji based on channel type
      let emoji = '📝'; // Default for text channels
      if (channel.type === 2) emoji = '🔊'; // Voice channel
      if (channel.type === 5) emoji = '📢'; // Announcement channel
      if (channel.type === 15) emoji = '📊'; // Forum channel
      if (channel.type === 13) emoji = '🎭'; // Stage channel
      
      return {
        label: channel.name,
        description: `Type: ${channel.type === 0 ? 'Text' : channel.type === 2 ? 'Voice' : channel.type === 5 ? 'Announcement' : channel.type === 15 ? 'Forum' : channel.type === 13 ? 'Stage' : 'Other'}`,
        value: channel.id,
        emoji: emoji
      };
    });

  selectMenu.addOptions(channelOptions);

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