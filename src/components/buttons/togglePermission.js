import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'toggle_permission';

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

  // Extract parameters from the custom ID
  const [_, roleId, permissionBigInt] = interaction.customId.split(':');
  const permission = BigInt(permissionBigInt);
  
  // Fetch the role
  const role = await interaction.guild.roles.fetch(roleId);
  
  if (!role) {
    return await interaction.reply({
      content: '❌ Role not found. It may have been deleted.',
      ephemeral: true
    });
  }

  // Get the current permissions of the role
  const currentPermissions = role.permissions.clone();
  
  // Check if the permission is currently enabled
  const isEnabled = currentPermissions.has(permission);
  
  try {
    // Toggle the permission
    if (isEnabled) {
      currentPermissions.remove(permission);
    } else {
      currentPermissions.add(permission);
    }
    
    // Update the role permissions
    await role.setPermissions(currentPermissions);
    
    // Get the permission name for display
    const permissionName = Object.entries(PermissionFlagsBits).find(([_, value]) => value === permission)?.[0] || 'Unknown';
    const formattedPermName = formatPermissionName(permissionName);
    
    // Create a success embed
    const embed = createSuccessEmbed(
      `Permission ${isEnabled ? 'Disabled' : 'Enabled'}`,
      `Successfully ${isEnabled ? 'disabled' : 'enabled'} the **${formattedPermName}** permission for the **${role.name}** role.`
    );
    
    // Send an ephemeral message with the result
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
    
    // Update the button to reflect the new state
    const message = await interaction.message;
    const components = message.components;
    
    // Find and update the button that was clicked
    for (const row of components) {
      for (const component of row.components) {
        if (component.customId === interaction.customId) {
          component.style = isEnabled ? ButtonStyle.Danger : ButtonStyle.Success;
          break;
        }
      }
    }
    
    // Update the message with the updated components
    await interaction.message.edit({
      components: components
    });
  } catch (error) {
    console.error(error);
    
    // Create an error embed
    const embed = createErrorEmbed(
      'Error Updating Permissions',
      `Failed to update the role permissions: ${error.message}`
    );
    
    // Send an ephemeral message with the error
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
}