import { ActionRowBuilder, StringSelectMenuBuilder, ChannelType } from 'discord.js';
import { createPanelEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'delete_channel';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  try {
    // Get all channels from the guild
    const channels = await interaction.guild.channels.fetch();
    
    // Filter out categories for now (they'll be handled separately)
    const nonCategoryChannels = channels.filter(channel => 
      channel.type !== ChannelType.GuildCategory
    );

    if (nonCategoryChannels.size === 0) {
      // No channels available to delete
      const errorEmbed = createErrorEmbed(
        'No Channels Available',
        'There are no non-category channels available to delete.'
      );

      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true
      });
      return;
    }

    // Create the embed
    const embed = createPanelEmbed(
      'Delete Channel',
      '> Select a channel to delete from the menu below.\n\n' +
      '**Warning:** This action cannot be undone. The channel and all its content will be permanently deleted.'
    );

    // Create the select menu with the available channels
    const selectOptions = nonCategoryChannels.map(channel => {
      // Determine channel type emoji
      let emoji = '📝'; // Default for text channels
      if (channel.type === ChannelType.GuildVoice) emoji = '🔊';
      else if (channel.type === ChannelType.GuildAnnouncement) emoji = '📢';
      else if (channel.type === ChannelType.GuildForum) emoji = '💬';
      
      return {
        label: channel.name,
        description: `ID: ${channel.id}`,
        value: channel.id,
        emoji: emoji
      };
    });

    // Create the select menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('delete_channel_select')
      .setPlaceholder('Select a channel to delete')
      .addOptions(selectOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Send the message with the select menu
    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error',
      `Failed to load channels: **${error.message}**\n` +
      'Please try again later.'
    );

    // Send the error message
    await interaction.reply({
      embeds: [errorEmbed],
      ephemeral: true
    });
  }
}