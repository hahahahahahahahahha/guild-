import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'toggle_channel_permission';

// Helper function to get permission categories
const getPermissionCategories = () => {
  return [
    {
      name: 'General Channel Permissions',
      permissions: [
        'ViewChannel',
        'ManageChannels',
        'ManageRoles',
        'CreateInstantInvite',
        'ManageWebhooks'
      ]
    },
    {
      name: 'Text Channel Permissions',
      permissions: [
        'SendMessages',
        'SendMessagesInThreads',
        'CreatePublicThreads',
        'CreatePrivateThreads',
        'EmbedLinks',
        'AttachFiles',
        'AddReactions',
        'UseExternalEmojis',
        'UseExternalStickers',
        'MentionEveryone',
        'ManageMessages',
        'ManageThreads',
        'ReadMessageHistory',
        'SendTTSMessages',
        'UseApplicationCommands'
      ]
    },
    {
      name: 'Voice Channel Permissions',
      permissions: [
        'Connect',
        'Speak',
        'Stream',
        'UseEmbeddedActivities',
        'UseVAD',
        'PrioritySpeaker',
        'MuteMembers',
        'DeafenMembers',
        'MoveMembers',
        'RequestToSpeak'
      ]
    }
  ];
};

// Helper function to get a human-readable name for a permission
const getPermissionName = (permission) => {
  const names = {
    'ViewChannel': 'View Channel',
    'ManageChannels': 'Manage Channel',
    'ManageRoles': 'Manage Permissions',
    'CreateInstantInvite': 'Create Invite',
    'ManageWebhooks': 'Manage Webhooks',
    'SendMessages': 'Send Messages',
    'SendMessagesInThreads': 'Send Messages in Threads',
    'CreatePublicThreads': 'Create Public Threads',
    'CreatePrivateThreads': 'Create Private Threads',
    'EmbedLinks': 'Embed Links',
    'AttachFiles': 'Attach Files',
    'AddReactions': 'Add Reactions',
    'UseExternalEmojis': 'Use External Emojis',
    'UseExternalStickers': 'Use External Stickers',
    'MentionEveryone': 'Mention @everyone, @here, and All Roles',
    'ManageMessages': 'Manage Messages',
    'ManageThreads': 'Manage Threads',
    'ReadMessageHistory': 'Read Message History',
    'SendTTSMessages': 'Send Text-to-Speech Messages',
    'UseApplicationCommands': 'Use Application Commands',
    'Connect': 'Connect',
    'Speak': 'Speak',
    'Stream': 'Video',
    'UseEmbeddedActivities': 'Use Activities',
    'UseVAD': 'Use Voice Activity',
    'PrioritySpeaker': 'Priority Speaker',
    'MuteMembers': 'Mute Members',
    'DeafenMembers': 'Deafen Members',
    'MoveMembers': 'Move Members',
    'RequestToSpeak': 'Request to Speak'
  };
  
  return names[permission] || permission;
};

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract parameters from the custom ID
  const [channelId, roleId, permission, categoryIndex] = interaction.customId.split(':').slice(1);
  
  // Fetch the channel and role
  const channel = await interaction.guild.channels.fetch(channelId);
  const role = await interaction.guild.roles.fetch(roleId);
  
  if (!channel || !role) {
    return await interaction.reply({
      content: '❌ Channel or role not found. They may have been deleted.',
      ephemeral: true
    });
  }

  // Get the current permissions for the role in the channel
  const currentPermissions = channel.permissionOverwrites.cache.get(roleId);
  
  // Determine the current state of the permission
  let currentState = 'neutral';
  if (currentPermissions) {
    if (currentPermissions.allow.has(PermissionsBitField.Flags[permission])) {
      currentState = 'allow';
    } else if (currentPermissions.deny.has(PermissionsBitField.Flags[permission])) {
      currentState = 'deny';
    }
  }
  
  // Determine the new state (cycle through neutral -> allow -> deny -> neutral)
  let newState;
  if (currentState === 'neutral') {
    newState = 'allow';
  } else if (currentState === 'allow') {
    newState = 'deny';
  } else {
    newState = 'neutral';
  }
  
  try {
    // Update the permission
    if (newState === 'allow') {
      await channel.permissionOverwrites.edit(roleId, {
        [permission]: true
      }, { reason: `Permission updated by ${interaction.user.tag}` });
    } else if (newState === 'deny') {
      await channel.permissionOverwrites.edit(roleId, {
        [permission]: false
      }, { reason: `Permission updated by ${interaction.user.tag}` });
    } else {
      // For neutral, we need to remove the permission override
      // First, get all current permissions
      const currentOverwrites = channel.permissionOverwrites.cache.get(roleId);
      if (currentOverwrites) {
        const allowPermissions = currentOverwrites.allow.remove(PermissionsBitField.Flags[permission]);
        const denyPermissions = currentOverwrites.deny.remove(PermissionsBitField.Flags[permission]);
        
        // If there are no permissions left, remove the overwrite entirely
        if (allowPermissions.bitfield === 0n && denyPermissions.bitfield === 0n) {
          await channel.permissionOverwrites.delete(roleId, `Permission reset by ${interaction.user.tag}`);
        } else {
          // Otherwise, update with the new permissions
          await channel.permissionOverwrites.edit(roleId, {
            [permission]: null
          }, { reason: `Permission updated by ${interaction.user.tag}` });
        }
      }
    }
    
    // Send a success message
    await interaction.reply({
      embeds: [createSuccessEmbed(
        'Permission Updated',
        `Successfully ${newState === 'allow' ? 'allowed' : newState === 'deny' ? 'denied' : 'reset'} the **${getPermissionName(permission)}** permission for **${role.name}** in **${channel.name}**.`
      )],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    
    // Send an error message
    await interaction.reply({
      embeds: [createErrorEmbed(
        'Error Updating Permission',
        `Failed to update the permission: ${error.message}`
      )],
      ephemeral: true
    });
    
    return;
  }
  
  // Refresh the permission category view
  // Get permission categories
  const permissionCategories = getPermissionCategories();
  const selectedCategory = permissionCategories[categoryIndex];
  
  if (!selectedCategory) {
    return;
  }

  // Create the embed
  const embed = interaction.message.embeds[0];

  // Create buttons for each permission in the category
  const rows = [];
  let currentRow = new ActionRowBuilder();
  let buttonCount = 0;

  // Fetch the updated permissions
  const updatedPermissions = channel.permissionOverwrites.cache.get(roleId);

  for (const perm of selectedCategory.permissions) {
    // Check if the permission is allowed, denied, or neutral
    let status = 'Neutral';
    let style = ButtonStyle.Secondary;
    let emoji = '⚪';
    
    if (updatedPermissions) {
      if (updatedPermissions.allow.has(PermissionsBitField.Flags[perm])) {
        status = 'Allowed';
        style = ButtonStyle.Success;
        emoji = '✅';
      } else if (updatedPermissions.deny.has(PermissionsBitField.Flags[perm])) {
        status = 'Denied';
        style = ButtonStyle.Danger;
        emoji = '❌';
      }
    }

    // Create a button for the permission
    const button = new ButtonBuilder()
      .setCustomId(`toggle_channel_permission:${channelId}:${roleId}:${perm}:${categoryIndex}`)
      .setLabel(getPermissionName(perm))
      .setStyle(style)
      .setEmoji(emoji);

    // Add the button to the current row
    currentRow.addComponents(button);
    buttonCount++;

    // If we've added 3 buttons to the row, start a new row
    if (buttonCount % 3 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  }

  // Add the last row if it has any buttons
  if (currentRow.components.length > 0) {
    rows.push(currentRow);
  }

  // Create a back button
  const backRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`channel_role_permissions_select:${channelId}`)
        .setLabel('Back to Categories')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Add the back row
  rows.push(backRow);

  // Update the message with the new components
  await interaction.message.edit({
    embeds: [embed],
    components: rows
  });
}