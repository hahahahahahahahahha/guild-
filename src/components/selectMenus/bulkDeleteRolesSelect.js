import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'bulk_delete_roles_select';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the selected role IDs
  const selectedRoleIds = interaction.values;
  
  // Fetch the roles
  const selectedRoles = [];
  for (const roleId of selectedRoleIds) {
    const role = await interaction.guild.roles.fetch(roleId);
    if (role) {
      selectedRoles.push(role);
    }
  }

  if (selectedRoles.length === 0) {
    return await interaction.reply({
      content: '❌ None of the selected roles were found. They may have been deleted.',
      ephemeral: true
    });
  }

  // Create a confirmation embed
  const embed = createPanelEmbed(
    'Confirm Bulk Role Deletion',
    `> You are about to delete **${selectedRoles.length}** roles.\n\n` +
    `**Selected Roles:**\n${selectedRoles.map(role => `• ${role.name}`).join('\n')}\n\n` +
    `**Warning:** This action cannot be undone. Are you sure you want to continue?`
  );

  // Create confirmation buttons
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_bulk_delete_roles:${selectedRoleIds.join(',')}`)
        .setLabel(`Delete ${selectedRoles.length} Roles`)
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚠️'),
      new ButtonBuilder()
        .setCustomId('bulk_role_operations')
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