import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed, createLoadingEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'confirm_delete_role';

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
        'The selected role could not be found. It may have been deleted already.'
      );

      await interaction.update({
        embeds: [errorEmbed],
        components: []
      });
      return;
    }

    // Create loading embed
    const loadingEmbed = createLoadingEmbed(
      'Deleting Role',
      `Deleting role: **${role.name}**...`
    );

    // Update with loading message
    await interaction.update({
      embeds: [loadingEmbed],
      components: []
    });

    // Store role name for the success message
    const roleName = role.name;

    // Delete the role
    await role.delete(`Deleted by ${interaction.user.tag}`);

    // Create success embed
    const successEmbed = createSuccessEmbed(
      'Role Deleted',
      `Successfully deleted role: **${roleName}**`
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

    // Update with success message
    await interaction.editReply({
      embeds: [successEmbed],
      components: [row]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error Deleting Role',
      `Failed to delete role: **${error.message}**\n` +
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