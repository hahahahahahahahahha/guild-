import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'view_roles';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Fetch all roles from the guild
  const roles = await interaction.guild.roles.fetch();
  
  // Sort roles by position (highest position first)
  const sortedRoles = [...roles.values()].sort((a, b) => b.position - a.position);
  
  // Create an embed to display the roles
  const embed = new EmbedBuilder()
    .setTitle('📋 Server Roles')
    .setColor('#3498db')
    .setDescription('Here are all the roles in this server, sorted by position:')
    .setTimestamp();
  
  // Add fields for each role with its position, color, and member count
  let rolesText = '';
  
  sortedRoles.forEach(role => {
    // Skip @everyone role
    if (role.name === '@everyone') return;
    
    const hexColor = role.hexColor === '#000000' ? 'Default' : role.hexColor;
    const memberCount = role.members.size;
    
    rolesText += `**${role.position}.** ${role.name} (${role.id})\n`;
    rolesText += `> Color: ${hexColor} | Members: ${memberCount}\n`;
    rolesText += `> Mentionable: ${role.mentionable ? '✅' : '❌'} | Hoisted: ${role.hoist ? '✅' : '❌'}\n\n`;
  });
  
  // Split the roles text into chunks if it's too long
  const maxLength = 4000; // Maximum length for embed description
  
  if (rolesText.length <= maxLength) {
    embed.setDescription(`Here are all the roles in this server, sorted by position:\n\n${rolesText}`);
  } else {
    embed.setDescription('Here are all the roles in this server, sorted by position:');
    
    // Split the roles text into chunks
    let currentChunk = '';
    let fieldCount = 0;
    
    sortedRoles.forEach(role => {
      // Skip @everyone role
      if (role.name === '@everyone') return;
      
      const hexColor = role.hexColor === '#000000' ? 'Default' : role.hexColor;
      const memberCount = role.members.size;
      
      const roleText = `**${role.position}.** ${role.name} (${role.id})\n` +
                       `> Color: ${hexColor} | Members: ${memberCount}\n` +
                       `> Mentionable: ${role.mentionable ? '✅' : '❌'} | Hoisted: ${role.hoist ? '✅' : '❌'}\n\n`;
      
      // Check if adding this role would exceed the field value limit
      if (currentChunk.length + roleText.length > 1024) {
        embed.addFields({ name: `Roles (Part ${++fieldCount})`, value: currentChunk });
        currentChunk = roleText;
      } else {
        currentChunk += roleText;
      }
    });
    
    // Add the last chunk if it's not empty
    if (currentChunk.length > 0) {
      embed.addFields({ name: `Roles (Part ${++fieldCount})`, value: currentChunk });
    }
  }
  
  // Create buttons for role management
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_role')
        .setLabel('Create Role')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('delete_role')
        .setLabel('Delete Role')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('move_role')
        .setLabel('Move Role')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('↕️')
    );
  
  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('role_permissions')
        .setLabel('Manage Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId('bulk_role_operations')
        .setLabel('Bulk Operations')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋')
    );
  
  // Create a back button to return to the main panel
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_panel')
        .setLabel('Back to Main Panel')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );
  
  // Send the embed with the buttons
  await interaction.reply({
    embeds: [embed],
    components: [row, row2, row3],
    ephemeral: true
  });
}