import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'bulk_color_roles';

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
    'Bulk Color Roles',
    '> Select multiple roles to change their color at once.\n\n' +
    'You can select up to 25 roles to color at once. After selecting the roles, you will be prompted to enter a color.'
  );

  // Create a select menu with available roles
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('bulk_color_roles_select')
    .setPlaceholder('Select roles to color')
    .setMinValues(1)
    .setMaxValues(Math.min(25, availableRoles.size));

  // Add options for each role
  const roleOptions = availableRoles
    .sort((a, b) => b.position - a.position) // Sort by position (highest first)
    .map(role => ({
      label: role.name,
      description: role.hexColor !== '#000000' ? `Current color: ${role.hexColor}` : 'No color set',
      value: role.id,
      emoji: '🎨'
    }));

  selectMenu.addOptions(roleOptions);

  // Create the action row with the select menu
  const row = new ActionRowBuilder().addComponents(selectMenu);

  // Create a back button
  const backRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bulk_role_operations')
        .setLabel('Back to Bulk Operations')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: [row, backRow]
  });
}