import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'view_channel_permissions';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract the channel ID from the custom ID
  const channelId = interaction.customId.split(':')[1];
  
  // Fetch the channel
  const channel = await interaction.guild.channels.fetch(channelId);
  
  if (!channel) {
    return await interaction.reply({
      content: '❌ Channel not found. It may have been deleted.',
      ephemeral: true
    });
  }

  // Get all permission overwrites for the channel
  const permissionOverwrites = channel.permissionOverwrites.cache;
  
  // Create the embed
  const embed = createPanelEmbed(
    `Channel Permissions: ${channel.name}`,
    `> Overview of all permission overwrites for the **${channel.name}** channel.\n\n` +
    `**Channel Type:** ${channel.type === 4 ? 'Category' : channel.type === 0 ? 'Text' : channel.type === 2 ? 'Voice' : channel.type === 5 ? 'Announcement' : channel.type === 15 ? 'Forum' : channel.type === 13 ? 'Stage' : 'Other'}\n\n` +
    `Total permission overwrites: **${permissionOverwrites.size}**`
  );

  // Create a list of all permission overwrites
  const fields = [];
  
  // Process role overwrites
  const roleOverwrites = permissionOverwrites.filter(overwrite => overwrite.type === 0);
  if (roleOverwrites.size > 0) {
    let roleText = '';
    
    for (const [id, overwrite] of roleOverwrites) {
      const role = await interaction.guild.roles.fetch(id);
      if (role) {
        roleText += `**${role.name}** (ID: ${role.id})\n`;
        
        // Count allowed and denied permissions
        const allowedCount = overwrite.allow.toArray().length;
        const deniedCount = overwrite.deny.toArray().length;
        
        roleText += `↳ ${allowedCount} allowed, ${deniedCount} denied\n\n`;
      }
    }
    
    fields.push({ name: '🔒 Role Overwrites', value: roleText || 'None', inline: false });
  }
  
  // Process member overwrites
  const memberOverwrites = permissionOverwrites.filter(overwrite => overwrite.type === 1);
  if (memberOverwrites.size > 0) {
    let memberText = '';
    
    for (const [id, overwrite] of memberOverwrites) {
      try {
        const member = await interaction.guild.members.fetch(id);
        if (member) {
          memberText += `**${member.user.tag}** (ID: ${member.id})\n`;
          
          // Count allowed and denied permissions
          const allowedCount = overwrite.allow.toArray().length;
          const deniedCount = overwrite.deny.toArray().length;
          
          memberText += `↳ ${allowedCount} allowed, ${deniedCount} denied\n\n`;
        }
      } catch (error) {
        // Member might not be in the guild anymore
        memberText += `**Unknown Member** (ID: ${id})\n`;
        
        // Count allowed and denied permissions
        const allowedCount = overwrite.allow.toArray().length;
        const deniedCount = overwrite.deny.toArray().length;
        
        memberText += `↳ ${allowedCount} allowed, ${deniedCount} denied\n\n`;
      }
    }
    
    fields.push({ name: '👤 Member Overwrites', value: memberText || 'None', inline: false });
  }
  
  // Add fields to the embed
  for (const field of fields) {
    embed.addFields(field);
  }
  
  // If there are no overwrites, add a message
  if (fields.length === 0) {
    embed.addFields({ name: 'No Overwrites', value: 'This channel has no permission overwrites.', inline: false });
  }

  // Create a back button
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`channel_permissions_select`)
        .setLabel('Back to Channel Selection')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Reply with the embed and button
  await interaction.update({
    embeds: [embed],
    components: [row]
  });
}