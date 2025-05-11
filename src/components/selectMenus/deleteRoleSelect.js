import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createPanelEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'delete_role_select';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  try {
    // Get the selected role ID
    const roleId = interaction.values[0];
    
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

    // Create the confirmation embed
    const embed = createPanelEmbed(
      'Confirm Role Deletion',
      `> Are you sure you want to delete the role **${role.name}**?\n\n` +
      '**Warning:** This action cannot be undone. The role will be permanently deleted.'
    );

    // Create the confirmation buttons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_delete_role:${roleId}`)
          .setLabel('Delete Role')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('⚠️'),
        new ButtonBuilder()
          .setCustomId('cancel_delete_role')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✖️')
      );

    // Send the confirmation message
    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error',
      `Failed to process role deletion: **${error.message}**\n` +
      'Please try again later.'
    );

    // Send the error message
    await interaction.update({
      embeds: [errorEmbed],
      components: []
    });
  }
}