import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed, createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'reset_permissions';

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

  // Create a confirmation embed
  const embed = createPanelEmbed(
    'Reset Role Permissions',
    `> Are you sure you want to reset all permissions for the **${role.name}** role?\n\n` +
    `This will remove all permissions from the role. This action cannot be undone.`
  );

  // Create confirmation buttons
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_reset_permissions:${roleId}`)
        .setLabel('Reset All Permissions')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚠️'),
      new ButtonBuilder()
        .setCustomId(`role_permissions_select:${roleId}`)
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('✖️')
    );

  // Update the message with the confirmation
  await interaction.update({
    embeds: [embed],
    components: [row]
  });
}