import { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'role_permissions';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get all roles from the guild
  const roles = await interaction.guild.roles.fetch();
  
  // Filter out @everyone and roles higher than the bot's highest role
  const botRole = interaction.guild.members.me.roles.highest;
  const availableRoles = roles.filter(role => 
    role.id !== interaction.guild.id && // Filter out @everyone
    role.position < botRole.position    // Filter out roles higher than the bot's highest role
  );

  if (availableRoles.size === 0) {
    return await interaction.reply({
      content: '⚠️ There are no roles that can be modified by the bot.',
      ephemeral: true
    });
  }

  // Create the embed
  const embed = createPanelEmbed(
    'Role Permissions Management',
    '> Select a role to manage its permissions.\n\n' +
    'You can modify various permissions for the selected role, including:\n' +
    '• Administrative permissions\n' +
    '• Channel management permissions\n' +
    '• Message management permissions\n' +
    '• Member management permissions\n' +
    '• And more...'
  );

  // Create a select menu with available roles
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('role_permissions_select')
    .setPlaceholder('Select a role to manage permissions')
    .setMaxValues(1);

  // Add options for each role (limit to 25 due to Discord's limitations)
  const roleOptions = availableRoles
    .sort((a, b) => b.position - a.position) // Sort by position (highest first)
    .first(25)                              // Take only the first 25 roles
    .map(role => ({
      label: role.name,
      description: `Manage permissions for ${role.name}`,
      value: role.id,
      emoji: '🔒'
    }));

  selectMenu.addOptions(roleOptions);

  // Create the action row with the select menu
  const row = new ActionRowBuilder().addComponents(selectMenu);

  // Create a back button
  const backRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_role_management')
        .setLabel('Back to Role Management')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: [row, backRow]
  });
}