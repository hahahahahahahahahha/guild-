import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createPanelEmbed, createErrorEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'move_role_select';

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
        'The selected role could not be found. It may have been deleted.'
      );

      await interaction.update({
        embeds: [errorEmbed],
        components: []
      });
      return;
    }

    // Create the embed
    const embed = createPanelEmbed(
      'Move Role',
      `> Selected Role: **${role.name}**\n` +
      `> Current Position: **${role.position}**\n\n` +
      'Click the buttons below to move the role up or down in the hierarchy.\n' +
      '**Note:** Higher positions have more permissions.'
    );

    // Create the buttons for moving the role
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`move_role_up:${roleId}`)
          .setLabel('Move Up')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬆️'),
        new ButtonBuilder()
          .setCustomId(`move_role_down:${roleId}`)
          .setLabel('Move Down')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬇️'),
        new ButtonBuilder()
          .setCustomId('cancel_move_role')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✖️')
      );

    // Send the message with the buttons
    await interaction.update({
      embeds: [embed],
      components: [row]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error',
      `Failed to process role movement: **${error.message}**\n` +
      'Please try again later.'
    );

    // Send the error message
    await interaction.update({
      embeds: [errorEmbed],
      components: []
    });
  }
}