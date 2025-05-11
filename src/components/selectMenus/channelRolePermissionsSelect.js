import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'channel_role_permissions_select';

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

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract the channel ID from the custom ID
  const channelId = interaction.customId.split(':')[1];
  
  // Get the selected role ID
  const roleId = interaction.values[0];
  
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
  
  // Create the embed
  const embed = createPanelEmbed(
    `Channel Permissions: ${channel.name} - ${role.name}`,
    `> Manage permissions for the **${role.name}** role in the **${channel.name}** channel.\n\n` +
    `Select a permission category to view and modify permissions.`
  );

  // Get permission categories
  const permissionCategories = getPermissionCategories();

  // Create a select menu for permission categories
  const categoryMenu = new StringSelectMenuBuilder()
    .setCustomId(`channel_perm_category_select:${channelId}:${roleId}`)
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
        .setCustomId(`allow_all_permissions:${channelId}:${roleId}`)
        .setLabel('Allow All')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId(`deny_all_permissions:${channelId}:${roleId}`)
        .setLabel('Deny All')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌'),
      new ButtonBuilder()
        .setCustomId(`reset_permissions:${channelId}:${roleId}`)
        .setLabel('Reset All')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔄')
    );

  // Create a back button
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`channel_permissions_select`)
        .setLabel('Back to Role Selection')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: [row, row2, row3]
  });
}