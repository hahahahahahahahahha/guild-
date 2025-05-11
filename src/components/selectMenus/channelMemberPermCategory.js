import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'channel_member_perm_category';

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

  // Extract the channel ID and member ID from the custom ID
  const [channelId, memberId] = interaction.customId.split(':').slice(1);
  
  // Get the selected category index
  const categoryIndex = parseInt(interaction.values[0]);
  
  // Fetch the channel and member
  const channel = await interaction.guild.channels.fetch(channelId);
  const member = await interaction.guild.members.fetch(memberId);
  
  if (!channel || !member) {
    return await interaction.reply({
      content: '❌ Channel or member not found. They may have been deleted or left the server.',
      ephemeral: true
    });
  }

  // Get the current permissions for the member in the channel
  const currentPermissions = channel.permissionOverwrites.cache.get(memberId);
  
  // Get permission categories
  const permissionCategories = getPermissionCategories();
  const selectedCategory = permissionCategories[categoryIndex];
  
  if (!selectedCategory) {
    return await interaction.reply({
      content: '❌ Invalid permission category.',
      ephemeral: true
    });
  }

  // Create the embed
  const embed = createPanelEmbed(
    `${selectedCategory.name}: ${member.user.tag} in ${channel.name}`,
    `> Manage **${selectedCategory.name.toLowerCase()}** for **${member.user.tag}** in the **${channel.name}** channel.\n\n` +
    `Click on the buttons below to toggle permissions. Current status is shown in the buttons.`
  );

  // Create buttons for each permission in the category
  const rows = [];
  let currentRow = new ActionRowBuilder();
  let buttonCount = 0;

  for (const permission of selectedCategory.permissions) {
    // Check if the permission is allowed, denied, or neutral
    let status = 'Neutral';
    let style = ButtonStyle.Secondary;
    let emoji = '⚪';
    
    if (currentPermissions) {
      if (currentPermissions.allow.has(PermissionsBitField.Flags[permission])) {
        status = 'Allowed';
        style = ButtonStyle.Success;
        emoji = '✅';
      } else if (currentPermissions.deny.has(PermissionsBitField.Flags[permission])) {
        status = 'Denied';
        style = ButtonStyle.Danger;
        emoji = '❌';
      }
    }

    // Create a button for the permission
    const button = new ButtonBuilder()
      .setCustomId(`toggle_member_permission:${channelId}:${memberId}:${permission}:${categoryIndex}`)
      .setLabel(getPermissionName(permission))
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
        .setCustomId(`add_member_permission_modal:${channelId}`)
        .setLabel('Back to Categories')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Add the back row
  rows.push(backRow);

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: rows
  });
}