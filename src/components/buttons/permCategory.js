import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'perm_category';

// Helper function to format permission names
const formatPermissionName = (permName) => {
  return permName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/_/g, ' ')         // Replace underscores with spaces
    .trim()                     // Remove trailing spaces
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); // Capitalize first letter of each word
};

// Permission categories
const permissionCategories = {
  admin: [
    PermissionFlagsBits.Administrator,
    PermissionFlagsBits.ManageGuild,
    PermissionFlagsBits.ManageRoles,
    PermissionFlagsBits.ManageWebhooks,
    PermissionFlagsBits.ManageEmojisAndStickers,
    PermissionFlagsBits.ManageEvents,
    PermissionFlagsBits.ViewAuditLog,
    PermissionFlagsBits.ViewGuildInsights
  ],
  channel: [
    PermissionFlagsBits.ManageChannels,
    PermissionFlagsBits.CreateInstantInvite,
    PermissionFlagsBits.ViewChannel
  ],
  message: [
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.SendMessagesInThreads,
    PermissionFlagsBits.CreatePublicThreads,
    PermissionFlagsBits.CreatePrivateThreads,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.UseExternalEmojis,
    PermissionFlagsBits.UseExternalStickers,
    PermissionFlagsBits.MentionEveryone,
    PermissionFlagsBits.ManageMessages,
    PermissionFlagsBits.ManageThreads,
    PermissionFlagsBits.ReadMessageHistory
  ],
  member: [
    PermissionFlagsBits.KickMembers,
    PermissionFlagsBits.BanMembers,
    PermissionFlagsBits.ModerateMembers,
    PermissionFlagsBits.ChangeNickname,
    PermissionFlagsBits.ManageNicknames
  ],
  voice: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak,
    PermissionFlagsBits.Stream,
    PermissionFlagsBits.UseEmbeddedActivities,
    PermissionFlagsBits.UseVAD,
    PermissionFlagsBits.PrioritySpeaker,
    PermissionFlagsBits.MuteMembers,
    PermissionFlagsBits.DeafenMembers,
    PermissionFlagsBits.MoveMembers
  ],
  advanced: [
    PermissionFlagsBits.RequestToSpeak,
    PermissionFlagsBits.ManageGuildExpressions,
    PermissionFlagsBits.ViewCreatorMonetizationAnalytics,
    PermissionFlagsBits.UseSoundboard,
    PermissionFlagsBits.UseExternalSounds,
    PermissionFlagsBits.SendVoiceMessages
  ]
};

// Category titles
const categoryTitles = {
  admin: 'Administrative Permissions',
  channel: 'Channel Management Permissions',
  message: 'Message Management Permissions',
  member: 'Member Management Permissions',
  voice: 'Voice Permissions',
  advanced: 'Advanced Permissions'
};

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract parameters from the custom ID
  const [_, roleId, category] = interaction.customId.split(':');
  
  // Fetch the role
  const role = await interaction.guild.roles.fetch(roleId);
  
  if (!role) {
    return await interaction.reply({
      content: '❌ Role not found. It may have been deleted.',
      ephemeral: true
    });
  }

  // Get the current permissions of the role
  const currentPermissions = role.permissions;
  
  // Get the permissions for the selected category
  const categoryPermissions = permissionCategories[category];
  
  if (!categoryPermissions) {
    return await interaction.reply({
      content: '❌ Invalid permission category.',
      ephemeral: true
    });
  }

  // Create the embed
  const embed = createPanelEmbed(
    `${categoryTitles[category]} for ${role.name}`,
    `> Toggle permissions for the **${role.name}** role.\n\n` +
    `Select the permissions you want to toggle for this role. Green buttons indicate enabled permissions, red buttons indicate disabled permissions.`
  );

  // Create buttons for each permission in the category (up to 3 rows of 5 buttons each)
  const rows = [];
  let currentRow = new ActionRowBuilder();
  let buttonCount = 0;

  for (const permission of categoryPermissions) {
    // Check if the permission is currently enabled
    const isEnabled = currentPermissions.has(permission);
    
    // Create a button for the permission
    const button = new ButtonBuilder()
      .setCustomId(`toggle_permission:${roleId}:${permission}`)
      .setLabel(formatPermissionName(PermissionFlagsBits[permission]))
      .setStyle(isEnabled ? ButtonStyle.Success : ButtonStyle.Danger);
    
    // Add the button to the current row
    currentRow.addComponents(button);
    buttonCount++;
    
    // If we've added 5 buttons to the current row, start a new row
    if (buttonCount % 5 === 0) {
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
        .setCustomId(`role_permissions_select:${roleId}`)
        .setLabel('Back to Permission Categories')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );
  
  // Add the back button row
  if (rows.length < 5) {
    rows.push(backRow);
  }

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: rows
  });
}