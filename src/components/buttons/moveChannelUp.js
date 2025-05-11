import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed, createLoadingEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'move_channel_up';

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
        'The selected channel could not be found. It may have been deleted.'
      );

      await interaction.update({
        embeds: [errorEmbed],
        components: []
      });
      return;
    }

    // Create loading embed
    const loadingEmbed = createLoadingEmbed(
      'Moving Channel',
      `Moving channel **${channel.name}** up in the list...`
    );

    // Update with loading message
    await interaction.update({
      embeds: [loadingEmbed],
      components: []
    });

    // Get the current position
    const currentPosition = channel.position;
    
    // Move the channel up (lower position number)
    // Make sure we don't go below position 0
    const newPosition = Math.max(0, currentPosition - 1);
    await channel.setPosition(newPosition, { reason: `Moved by ${interaction.user.tag}` });
    
    // Fetch the updated channel
    const updatedChannel = await interaction.guild.channels.fetch(channelId);

    // Create success embed
    const successEmbed = createSuccessEmbed(
      'Channel Moved',
      `Successfully moved channel **${updatedChannel.name}**\n` +
      `Previous Position: **${currentPosition}**\n` +
      `New Position: **${updatedChannel.position}**`
    );

    // Create buttons for further actions
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`move_channel_up:${channelId}`)
          .setLabel('Move Up Again')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬆️'),
        new ButtonBuilder()
          .setCustomId(`move_channel_down:${channelId}`)
          .setLabel('Move Down')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬇️'),
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
      'Error Moving Channel',
      `Failed to move channel: **${error.message}**\n` +
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