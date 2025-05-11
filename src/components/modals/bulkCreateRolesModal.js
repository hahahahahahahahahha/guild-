import { EmbedBuilder } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed, createProgressEmbed } from '../../utils/embeds.js';

export const customId = 'bulk_create_roles_modal';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the values from the modal
  const roleNames = interaction.fields.getTextInputValue('role_names').split('\n').filter(name => name.trim() !== '');
  const roleColor = interaction.fields.getTextInputValue('role_color') || null;
  const startPosition = interaction.fields.getTextInputValue('start_position') || null;

  // Validate the role names
  if (roleNames.length === 0) {
    return await interaction.reply({
      content: '❌ Please provide at least one role name.',
      ephemeral: true
    });
  }

  // Validate the role color if provided
  let colorValue = null;
  if (roleColor) {
    // Check if the color is a valid hex code
    if (!/^#[0-9A-F]{6}$/i.test(roleColor)) {
      return await interaction.reply({
        content: '❌ Invalid color format. Please use a valid hex color code (e.g., #FF0000).',
        ephemeral: true
      });
    }
    
    // Convert the hex color to a decimal value
    colorValue = parseInt(roleColor.substring(1), 16);
  }

  // Validate the start position if provided
  let positionValue = null;
  if (startPosition) {
    // Check if the position is a valid number
    if (!/^\d+$/.test(startPosition)) {
      return await interaction.reply({
        content: '❌ Invalid position. Please use a valid number.',
        ephemeral: true
      });
    }
    
    // Convert the position to a number
    positionValue = parseInt(startPosition);
  }

  // Send an initial response
  await interaction.reply({
    embeds: [createProgressEmbed('Creating Roles', `Starting to create ${roleNames.length} roles...`)],
    ephemeral: true
  });

  // Create the roles
  const createdRoles = [];
  const failedRoles = [];

  for (let i = 0; i < roleNames.length; i++) {
    const name = roleNames[i].trim();
    
    try {
      // Create the role
      const role = await interaction.guild.roles.create({
        name: name,
        color: colorValue,
        position: positionValue ? positionValue + i : undefined,
        reason: `Bulk role creation by ${interaction.user.tag}`
      });
      
      createdRoles.push(role);
      
      // Update the progress
      await interaction.editReply({
        embeds: [createProgressEmbed(
          'Creating Roles',
          `Progress: ${i + 1}/${roleNames.length} roles created\n\n` +
          `Last created: **${role.name}**`
        )],
        ephemeral: true
      });
    } catch (error) {
      console.error(`Error creating role ${name}:`, error);
      failedRoles.push({ name, error: error.message });
    }
  }

  // Create a final embed with the results
  const embed = new EmbedBuilder()
    .setTitle('Bulk Role Creation Results')
    .setColor(createdRoles.length > 0 ? '#00FF00' : '#FF0000')
    .setDescription(
      `**Successfully created ${createdRoles.length}/${roleNames.length} roles**\n\n` +
      (createdRoles.length > 0 ? `**Created Roles:**\n${createdRoles.map(role => `• ${role.name}`).join('\n')}\n\n` : '') +
      (failedRoles.length > 0 ? `**Failed Roles:**\n${failedRoles.map(role => `• ${role.name}: ${role.error}`).join('\n')}` : '')
    )
    .setTimestamp();

  // Send the final results
  await interaction.editReply({
    embeds: [embed],
    ephemeral: true
  });
}