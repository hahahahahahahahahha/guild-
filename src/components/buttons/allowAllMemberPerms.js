import { PermissionsBitField } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'allow_all_member_perms';

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
    // Get all permissions based on channel type
    let permissions = {};
    
    // General permissions for all channel types
    permissions.ViewChannel = true;
    permissions.CreateInstantInvite = true;
    
    // Text channel permissions
    if (channel.type === 0 || channel.type === 5 || channel.type === 15) {
      permissions.SendMessages = true;
      permissions.SendMessagesInThreads = true;
      permissions.CreatePublicThreads = true;
      permissions.CreatePrivateThreads = true;
      permissions.EmbedLinks = true;
      permissions.AttachFiles = true;
      permissions.AddReactions = true;
      permissions.UseExternalEmojis = true;
      permissions.UseExternalStickers = true;
      permissions.MentionEveryone = true;
      permissions.ReadMessageHistory = true;
      permissions.SendTTSMessages = true;
      permissions.UseApplicationCommands = true;
    }
    
    // Voice channel permissions
    if (channel.type === 2 || channel.type === 13) {
      permissions.Connect = true;
      permissions.Speak = true;
      permissions.Stream = true;
      permissions.UseEmbeddedActivities = true;
      permissions.UseVAD = true;
      permissions.PrioritySpeaker = true;
    }
    
    // Update the permissions
    await channel.permissionOverwrites.edit(memberId, permissions, {
      reason: `All permissions allowed by ${interaction.user.tag}`
    });
    
    // Send a success message
    await interaction.reply({
      embeds: [createSuccessEmbed(
        'Permissions Updated',
        `Successfully allowed all permissions for **${member.user.tag}** in **${channel.name}**.`
      )],
      ephemeral: true
    });
    
    // Update the message to show the member selection again
    await interaction.message.edit({
      components: interaction.message.components
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    
    // Send an error message
    await interaction.reply({
      embeds: [createErrorEmbed(
        'Error Updating Permissions',
        `Failed to update permissions: ${error.message}`
      )],
      ephemeral: true
    });
  }
}