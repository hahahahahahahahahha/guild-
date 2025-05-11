import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'add_member_permission_modal';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract the channel ID from the custom ID
  const channelId = interaction.customId.split(':')[1];
  
  // Get the member ID from the modal
  const memberId = interaction.fields.getTextInputValue('member_id');
  
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

  // Fetch the member
  try {
    const member = await interaction.guild.members.fetch(memberId);
    
    if (!member) {
      return await interaction.reply({
        embeds: [createErrorEmbed(
          'Error',
          'Member not found. Please check the ID and try again.'
        )],
        ephemeral: true
      });
    }

    // Create the embed
    const embed = createPanelEmbed(
      `Channel Permissions: ${channel.name} - ${member.user.tag}`,
      `> Manage permissions for **${member.user.tag}** in the **${channel.name}** channel.\n\n` +
      `Select a permission category to view and modify permissions.`
    );

    // Get permission categories
    const permissionCategories = [
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

    // Create a select menu for permission categories
    const categoryMenu = new StringSelectMenuBuilder()
      .setCustomId(`channel_member_perm_category:${channelId}:${memberId}`)
      .setPlaceholder('Select a permission category');

    // Add options for each category
    permissionCategories.forEach((category, index) => {
      categoryMenu.addOptions({
        label: category.name,
        description: `Manage ${category.name.toLowerCase()}`,
        value: `${index}`,
        emoji: '🔒'
      });
    });

    // Create the action row with the category menu
    const row = new ActionRowBuilder().addComponents(categoryMenu);

    // Create buttons for additional actions
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`allow_all_member_perms:${channelId}:${memberId}`)
          .setLabel('Allow All')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId(`deny_all_member_perms:${channelId}:${memberId}`)
          .setLabel('Deny All')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('❌'),
        new ButtonBuilder()
          .setCustomId(`reset_member_perms:${channelId}:${memberId}`)
          .setLabel('Reset All')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🔄')
      );

    // Create a back button
    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`channel_permissions_select`)
          .setLabel('Back to Channel Selection')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );

    // Reply with the embed and components
    await interaction.reply({
      embeds: [embed],
      components: [row, row2, row3],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    
    // Send an error message
    await interaction.reply({
      embeds: [createErrorEmbed(
        'Error',
        `Failed to fetch member: ${error.message}`
      )],
      ephemeral: true
    });
  }
}