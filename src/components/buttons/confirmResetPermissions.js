import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'confirm_reset_permissions';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract the role ID from the custom ID
  const roleId = interaction.customId.split(':')[1];
  
  // Fetch the role
  const role = await interaction.guild.roles.fetch(roleId);
  
  if (!role) {
    return await interaction.reply({
      content: '❌ Role not found. It may have been deleted.',
      ephemeral: true
    });
  }

  try {
    // Reset the role permissions to 0n (no permissions)
    await role.setPermissions(new PermissionsBitField(0n));
    
    // Create a success embed
    const embed = createSuccessEmbed(
      'Permissions Reset',
      `Successfully reset all permissions for the **${role.name}** role.`
    );
    
    // Send an ephemeral message with the result
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
    
    // Return to the role permissions select menu
    const selectEmbed = createPanelEmbed(
      'Role Permissions Management',
      '> Select a role to manage its permissions.\n\n' +
      'You can modify various permissions for the selected role, including:\n' +
      '• Administrative permissions\n' +
      '• Channel management permissions\n' +
      '• Message management permissions\n' +
      '• Member management permissions\n' +
      '• And more...'
    );

    // Get all roles from the guild
    const roles = await interaction.guild.roles.fetch();
    
    // Filter out @everyone and roles higher than the bot's highest role
    const botRole = interaction.guild.members.me.roles.highest;
    const availableRoles = roles.filter(role => 
      role.id !== interaction.guild.id && // Filter out @everyone
      role.position < botRole.position    // Filter out roles higher than the bot's highest role
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
    await interaction.message.edit({
      embeds: [selectEmbed],
      components: [row, backRow]
    });
  } catch (error) {
    console.error(error);
    
    // Create an error embed
    const embed = createErrorEmbed(
      'Error Resetting Permissions',
      `Failed to reset the role permissions: ${error.message}`
    );
    
    // Send an ephemeral message with the error
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
}