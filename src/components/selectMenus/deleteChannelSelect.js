import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createPanelEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'delete_channel_select';

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
        'The selected channel could not be found. It may have been deleted already.'
      );

      await interaction.update({
        embeds: [errorEmbed],
        components: []
      });
      return;
    }

    // Create the confirmation embed
    const embed = createPanelEmbed(
      'Confirm Channel Deletion',
      `> Are you sure you want to delete the channel **${channel.name}**?\n\n` +
      '**Warning:** This action cannot be undone. The channel and all its content will be permanently deleted.'
    );

    // Create the confirmation buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_delete_channel:${channelId}`)
          .setLabel('Delete Channel')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('⚠️'),
        new ButtonBuilder()
          .setCustomId('cancel_delete_channel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✖️')
      );

    // Send the confirmation message
    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error',
      `Failed to process channel deletion: **${error.message}**\n` +
      'Please try again later.'
    );

    // Send the error message
    await interaction.update({
      embeds: [errorEmbed],
      components: []
    });
  }
}