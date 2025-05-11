import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'back_to_role_management';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Create the embed for role management
  const embed = createPanelEmbed(
    'Role Management',
    '> Select an action to manage roles on this server.\n\n' +
    '**Available Actions:**\n' +
    '• Create a new role with custom name, color, and position\n' +
    '• Delete an existing role (except @everyone and roles above the bot)\n' +
    '• Move a role up or down in the hierarchy\n' +
    '• Manage role permissions\n' +
    '• Bulk role operations'
  );

  // Create buttons for role management
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_role')
        .setLabel('Create Role')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('delete_role')
        .setLabel('Delete Role')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('move_role')
        .setLabel('Move Role')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('↕️')
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('role_permissions')
        .setLabel('Manage Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId('bulk_role_operations')
        .setLabel('Bulk Operations')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋')
    );

  // Create a back button to return to the main panel
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_panel')
        .setLabel('Back to Main Panel')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the message with the new embed and components
  await interaction.update({
    embeds: [embed],
    components: [row1, row2, row3]
  });
}