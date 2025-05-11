import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed, createLoadingEmbed, createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'bulk_color_roles_modal';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract the role IDs from the custom ID
  const roleIds = interaction.customId.split(':')[1].split(',');
  
  // Get the color from the modal
  const color = interaction.fields.getTextInputValue('role_color');
  
  // Validate the color
  if (!/^#[0-9A-F]{6}$/i.test(color)) {
    return await interaction.reply({
      content: '❌ Invalid color format. Please use a valid hex color code (e.g., #FF0000).',
      ephemeral: true
    });
  }

  // Send an initial response
  await interaction.reply({
    embeds: [createLoadingEmbed('Coloring Roles', `Starting to color ${roleIds.length} roles with ${color}...`)],
    ephemeral: true
  });

  // Color the roles
  const coloredRoles = [];
  const failedRoles = [];

  for (let i = 0; i < roleIds.length; i++) {
    const roleId = roleIds[i];
    
    try {
      // Fetch the role
      const role = await interaction.guild.roles.fetch(roleId);
      
      if (!role) {
        failedRoles.push({ id: roleId, name: 'Unknown Role', error: 'Role not found' });
        continue;
      }
      
      // Update the role color
      await role.setColor(color, `Bulk role coloring by ${interaction.user.tag}`);
      
      coloredRoles.push({ id: roleId, name: role.name });
      
      // Update the progress
      await interaction.editReply({
        embeds: [createLoadingEmbed(
          'Coloring Roles',
          `Progress: ${i + 1}/${roleIds.length} roles colored\n\n` +
          `Last colored: **${role.name}**`
        )],
        ephemeral: true
      });
    } catch (error) {
      console.error(`Error coloring role ${roleId}:`, error);
      
      // Try to get the role name
      let roleName = 'Unknown Role';
      try {
        const role = await interaction.guild.roles.fetch(roleId);
        if (role) {
          roleName = role.name;
        }
      } catch {}
      
      failedRoles.push({ id: roleId, name: roleName, error: error.message });
    }
  }

  // Create a final embed with the results
  const embed = new EmbedBuilder()
    .setTitle('Bulk Role Coloring Results')
    .setColor(color)
    .setDescription(
      `**Successfully colored ${coloredRoles.length}/${roleIds.length} roles with ${color}**\n\n` +
      (coloredRoles.length > 0 ? `**Colored Roles:**\n${coloredRoles.map(role => `• ${role.name}`).join('\n')}\n\n` : '') +
      (failedRoles.length > 0 ? `**Failed Roles:**\n${failedRoles.map(role => `• ${role.name}: ${role.error}`).join('\n')}` : '')
    )
    .setTimestamp();

  // Send the final results
  await interaction.editReply({
    embeds: [embed],
    ephemeral: true
  });

  // Update the original message to show the bulk operations menu
  const bulkOperationsEmbed = createPanelEmbed(
    'Bulk Role Operations',
    '> Perform operations on multiple roles at once.\n\n' +
    '**Available Operations:**\n' +
    '• Create multiple roles at once\n' +
    '• Delete multiple roles at once\n' +
    '• Apply permissions to multiple roles\n' +
    '• Color multiple roles at once\n' +
    '• Reorganize role hierarchy'
  );

  // Create buttons for bulk role operations
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bulk_create_roles')
        .setLabel('Create Multiple Roles')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('bulk_delete_roles')
        .setLabel('Delete Multiple Roles')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️')
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bulk_permissions')
        .setLabel('Apply Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId('bulk_color_roles')
        .setLabel('Color Roles')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎨'),
      new ButtonBuilder()
        .setCustomId('reorganize_roles')
        .setLabel('Reorganize Hierarchy')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📊')
    );

  // Create a back button to return to role management
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_role_management')
        .setLabel('Back to Role Management')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the original message
  await interaction.message.edit({
    embeds: [bulkOperationsEmbed],
    components: [row1, row2, row3]
  });
}