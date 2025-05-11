import { checkAdmin } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'sync_permissions';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract the channel ID from the custom ID
  const channelId = interaction.customId.split(':')[1];
  
  // Fetch the channel
  const channel = await interaction.guild.channels.fetch(channelId);
  
  if (!channel) {
    return await interaction.reply({
      embeds: [createErrorEmbed(
        'Error',
        'Channel not found. It may have been deleted.'
      )],
      ephemeral: true
    });
  }

  // Check if the channel has a parent category
  if (!channel.parent) {
    return await interaction.reply({
      embeds: [createErrorEmbed(
        'Error',
        'This channel is not in a category. There are no permissions to sync with.'
      )],
      ephemeral: true
    });
  }

  try {
    // Sync permissions with the parent category
    await channel.lockPermissions();
    
    // Send a success message
    await interaction.reply({
      embeds: [createSuccessEmbed(
        'Permissions Synced',
        `Successfully synced permissions for **${channel.name}** with its parent category **${channel.parent.name}**.`
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error syncing permissions:', error);
    
    // Send an error message
    await interaction.reply({
      embeds: [createErrorEmbed(
        'Error Syncing Permissions',
        `Failed to sync permissions: ${error.message}`
      )],
      ephemeral: true
    });
  }
}