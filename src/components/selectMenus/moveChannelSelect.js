import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createPanelEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'move_channel_select';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  try {
    // Get the selected channel ID
    const channelId = interaction.values[0];
    
    // Get the channel
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel) {
      // Channel not found
      const errorEmbed = createErrorEmbed(
        'Channel Not Found',
        'The selected channel could not be found. It may have been deleted.'
      );

      await interaction.update({
        embeds: [errorEmbed],
        components: []
      });
      return;
    }

    // Create the embed
    const embed = createPanelEmbed(
      'Move Channel',
      `> Selected Channel: **${channel.name}**\n` +
      `> Current Position: **${channel.position}**\n\n` +
      'Click the buttons below to move the channel up or down in the list.'
    );

    // Create the buttons for moving the channel
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`move_channel_up:${channelId}`)
          .setLabel('Move Up')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬆️'),
        new ButtonBuilder()
          .setCustomId(`move_channel_down:${channelId}`)
          .setLabel('Move Down')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬇️'),
        new ButtonBuilder()
          .setCustomId('cancel_move_channel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✖️')
      );

    // Send the message with the buttons
    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error',
      `Failed to process channel movement: **${error.message}**\n` +
      'Please try again later.'
    );

    // Send the error message
    await interaction.update({
      embeds: [errorEmbed],
      components: []
    });
  }
}