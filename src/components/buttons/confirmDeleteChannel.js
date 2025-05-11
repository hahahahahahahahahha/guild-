import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed, createLoadingEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'confirm_delete_channel';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the channel ID from the custom ID
  const channelId = interaction.customId.split(':')[1];

  try {
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

    // Create loading embed
    const loadingEmbed = createLoadingEmbed(
      'Deleting Channel',
      `Deleting channel: **${channel.name}**...`
    );

    // Update with loading message
    await interaction.update({
      embeds: [loadingEmbed],
      components: []
    });

    // Store channel name for the success message
    const channelName = channel.name;

    // Delete the channel
    await channel.delete(`Deleted by ${interaction.user.tag}`);

    // Create success embed
    const successEmbed = createSuccessEmbed(
      'Channel Deleted',
      `Successfully deleted channel: **${channelName}**`
    );

    // Create back button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_to_panel')
          .setLabel('Back to Main Panel')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );

    // Update with success message
    await interaction.editReply({
      embeds: [successEmbed],
      components: [row]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error Deleting Channel',
      `Failed to delete channel: **${error.message}**\n` +
      'Please check that the bot has the necessary permissions and try again.'
    );

    // Create back button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_to_panel')
          .setLabel('Back to Main Panel')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );

    // Update with error message
    await interaction.editReply({
      embeds: [errorEmbed],
      components: [row]
    });
  }
}