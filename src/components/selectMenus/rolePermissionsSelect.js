import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'role_permissions_select';

// Helper function to format permission names
const formatPermissionName = (permName) => {
  return permName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/_/g, ' ')         // Replace underscores with spaces
    .trim()                     // Remove trailing spaces
    .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); // Capitalize first letter of each word
};

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  const roleId = interaction.values[0];
  const role = await interaction.guild.roles.fetch(roleId);

  if (!role) {
    return await interaction.reply({
      content: '❌ Role not found. It may have been deleted.',
      ephemeral: true
    });
  }

  // Get the current permissions of the role
  const currentPermissions = role.permissions.toArray();

  // Create the embed
  const embed = createPanelEmbed(
    `Permissions for ${role.name}`,
    `> Manage permissions for the **${role.name}** role.\n\n` +
    `**Current Permissions:**\n` +
    (currentPermissions.length > 0 
      ? currentPermissions.map(perm => `• ${formatPermissionName(perm)}`).join('\n')
      : '• No permissions set')
  );

  // Create permission category buttons
  const adminRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`perm_category:${roleId}:admin`)
        .setLabel('Administrative')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🛡️'),
      new ButtonBuilder()
        .setCustomId(`perm_category:${roleId}:channel`)
        .setLabel('Channel Management')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝'),
      new ButtonBuilder()
        .setCustomId(`perm_category:${roleId}:message`)
        .setLabel('Message Management')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💬')
    );

  const memberRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`perm_category:${roleId}:member`)
        .setLabel('Member Management')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('👥'),
      new ButtonBuilder()
        .setCustomId(`perm_category:${roleId}:voice`)
        .setLabel('Voice Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔊'),
      new ButtonBuilder()
        .setCustomId(`perm_category:${roleId}:advanced`)
        .setLabel('Advanced Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('⚙️')
    );

  // Create action buttons
  const actionRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`reset_permissions:${roleId}`)
        .setLabel('Reset All Permissions')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔄'),
      new ButtonBuilder()
        .setCustomId('role_permissions')
        .setLabel('Back to Role Selection')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️'),
      new ButtonBuilder()
        .setCustomId('back_to_role_management')
        .setLabel('Back to Role Management')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🏠')
    );

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: [adminRow, memberRow, actionRow]
  });
}