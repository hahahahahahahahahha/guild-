import { PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';

/**
 * Check if a user has administrator permissions
 * @param {Interaction} interaction - The interaction object
 * @returns {boolean} - Whether the user has administrator permissions
 */
export const isAdmin = (interaction) => {
  // Check if the user is the developer
  if (interaction.user.id === config.developerId) {
    return true;
  }
  
  // Check if the user has administrator permissions
  return interaction.member.permissions.has(PermissionFlagsBits.Administrator);
};

/**
 * Send an error message if the user doesn't have administrator permissions
 * @param {Interaction} interaction - The interaction object
 * @returns {Promise<boolean>} - Whether the user has administrator permissions
 */
export const checkAdmin = async (interaction) => {
  if (!isAdmin(interaction)) {
    await interaction.reply({
      content: '⛔ You do not have permission to use this command. Administrator permission is required.',
      ephemeral: true
    });
    return false;
  }
  return true;
};