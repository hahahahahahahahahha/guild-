import { checkAdmin } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'reset_member_perms';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract the channel ID and member ID from the custom ID
  const [channelId, memberId] = interaction.customId.split(':').slice(1);
  
  // Fetch the channel and member
  const channel = await interaction.guild.channels.fetch(channelId);
  const member = await interaction.guild.members.fetch(memberId);
  
  if (!channel || !member) {
    return await interaction.reply({
      embeds: [createErrorEmbed(
        'Error',
        'Channel or member not found. They may have been deleted or left the server.'
      )],
      ephemeral: true
    });
  }

  try {
    // Remove all permission overwrites for the member
    await channel.permissionOverwrites.delete(memberId, `Permissions reset by ${interaction.user.tag}`);
    
    // Send a success message
    await interaction.reply({
      embeds: [createSuccessEmbed(
        'Permissions Reset',
        `Successfully reset all permissions for **${member.user.tag}** in **${channel.name}**.\n\n` +
        `The member will now inherit permissions from their roles.`
      )],
      ephemeral: true
    });
    
    // Update the message to show the member selection again
    await interaction.message.edit({
      components: interaction.message.components
    });
  } catch (error) {
    console.error('Error resetting permissions:', error);
    
    // Send an error message
    await interaction.reply({
      embeds: [createErrorEmbed(
        'Error Resetting Permissions',
        `Failed to reset permissions: ${error.message}`
      )],
      ephemeral: true
    });
  }
}