import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed, createLoadingEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'move_role_up';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the role ID from the custom ID
  const roleId = interaction.customId.split(':')[1];

  try {
    // Get the role
    const role = await interaction.guild.roles.fetch(roleId);
    
    if (!role) {
      // Role not found
      const errorEmbed = createErrorEmbed(
        'Role Not Found',
        'The selected role could not be found. It may have been deleted.'
      );

      await interaction.update({
        embeds: [errorEmbed],
        components: []
      });
      return;
    }

    // Create loading embed
    const loadingEmbed = createLoadingEmbed(
      'Moving Role',
      `Moving role **${role.name}** up in the hierarchy...`
    );

    // Update with loading message
    await interaction.update({
      embeds: [loadingEmbed],
      components: []
    });

    // Get the current position
    const currentPosition = role.position;
    
    // Move the role up (higher position number)
    await role.setPosition(currentPosition + 1, { reason: `Moved by ${interaction.user.tag}` });
    
    // Fetch the updated role
    const updatedRole = await interaction.guild.roles.fetch(roleId);

    // Create success embed
    const successEmbed = createSuccessEmbed(
      'Role Moved',
      `Successfully moved role **${updatedRole.name}**\n` +
      `Previous Position: **${currentPosition}**\n` +
      `New Position: **${updatedRole.position}**`
    );

    // Create buttons for further actions
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`move_role_up:${roleId}`)
          .setLabel('Move Up Again')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬆️'),
        new ButtonBuilder()
          .setCustomId(`move_role_down:${roleId}`)
          .setLabel('Move Down')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬇️'),
        new ButtonBuilder()
          .setCustomId('back_to_panel')
          .setLabel('Back to Main Panel')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );

    // Update with success message
    await interaction.editReply({
      embeds: [successEmbed],
      components: [row]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error Moving Role',
      `Failed to move role: **${error.message}**\n` +
      'Please check that the bot has the necessary permissions and try again.'
    );

    // Create back button
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('back_to_panel')
          .setLabel('Back to Main Panel')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );

    // Update with error message
    await interaction.editReply({
      embeds: [errorEmbed],
      components: [row]
    });
  }
}