import { createSuccessEmbed, createErrorEmbed, createLoadingEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'create_role_modal';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the values from the modal
  const roleName = interaction.fields.getTextInputValue('role_name');
  const roleColor = interaction.fields.getTextInputValue('role_color') || null;
  const rolePosition = interaction.fields.getTextInputValue('role_position') || null;

  // Defer the reply to show we're processing
  await interaction.deferReply({ ephemeral: true });

  try {
    // Create loading embed
    const loadingEmbed = createLoadingEmbed(
      'Creating Role',
      `Creating role with name: **${roleName}**...`
    );

    // Send the loading message
    const message = await interaction.editReply({
      embeds: [loadingEmbed]
    });

    // Create the role
    const roleOptions = {
      name: roleName,
      reason: `Created by ${interaction.user.tag}`
    };

    // Add color if provided
    if (roleColor) {
      // Remove # if present
      const color = roleColor.startsWith('#') ? roleColor.substring(1) : roleColor;
      // Check if it's a valid hex color
      if (/^[0-9A-F]{6}$/i.test(color)) {
        roleOptions.color = parseInt(color, 16);
      }
    }

    // Create the role
    const newRole = await interaction.guild.roles.create(roleOptions);

    // Set position if provided
    if (rolePosition && !isNaN(parseInt(rolePosition))) {
      const position = parseInt(rolePosition);
      await newRole.setPosition(position);
    }

    // Create success embed
    const successEmbed = createSuccessEmbed(
      'Role Created',
      `Successfully created role: **${newRole.name}**\n` +
      `Color: ${newRole.hexColor}\n` +
      `Position: ${newRole.position}`
    );

    // Update the message with the success embed
    await interaction.editReply({
      embeds: [successEmbed]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error Creating Role',
      `Failed to create role: **${error.message}**\n` +
      'Please check that the bot has the necessary permissions and try again.'
    );

    // Update the message with the error embed
    await interaction.editReply({
      embeds: [errorEmbed]
    });
  }
}