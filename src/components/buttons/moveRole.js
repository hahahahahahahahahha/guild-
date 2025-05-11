import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { createPanelEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'move_role';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  try {
    // Get all roles from the guild
    const roles = await interaction.guild.roles.fetch();
    
    // Filter out @everyone role and roles higher than the bot's highest role
    const botRole = interaction.guild.members.me.roles.highest;
    const availableRoles = roles.filter(role => 
      !role.managed && 
      role.id !== interaction.guild.id && // Filter out @everyone
      role.position < botRole.position // Filter out roles higher than the bot's highest role
    );

    if (availableRoles.size === 0) {
      // No roles available to move
      const errorEmbed = createErrorEmbed(
        'No Roles Available',
        'There are no roles available to move. This could be because all roles are either:\n' +
        '• The @everyone role\n' +
        '• Managed by integrations\n' +
        '• Higher than the bot\'s highest role'
      );

      await interaction.reply({
        embeds: [errorEmbed],
        ephemeral: true
      });
      return;
    }

    // Create the embed
    const embed = createPanelEmbed(
      'Move Role',
      '> Select a role to move from the menu below.\n\n' +
      'After selecting a role, you will be able to move it up or down in the role hierarchy.'
    );

    // Create the select menu with the available roles
    const selectOptions = availableRoles.map(role => ({
      label: role.name,
      description: `Position: ${role.position}`,
      value: role.id,
      emoji: '🏷️'
    }));

    // Create the select menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('move_role_select')
      .setPlaceholder('Select a role to move')
      .addOptions(selectOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Send the message with the select menu
    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error',
      `Failed to load roles: **${error.message}**\n` +
      'Please try again later.'
    );

    // Send the error message
    await interaction.reply({
      embeds: [errorEmbed],
      ephemeral: true
    });
  }
}