import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'view_channels';

// Helper function to get channel type name
function getChannelTypeName(type) {
  const typeMap = {
    [ChannelType.GuildText]: 'Text',
    [ChannelType.GuildVoice]: 'Voice',
    [ChannelType.GuildCategory]: 'Category',
    [ChannelType.GuildAnnouncement]: 'Announcement',
    [ChannelType.GuildForum]: 'Forum',
    [ChannelType.GuildStageVoice]: 'Stage',
    [ChannelType.PublicThread]: 'Public Thread',
    [ChannelType.PrivateThread]: 'Private Thread',
    [ChannelType.AnnouncementThread]: 'Announcement Thread'
  };
  
  return typeMap[type] || 'Unknown';
}

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Fetch all channels from the guild
  const channels = await interaction.guild.channels.fetch();
  
  // Group channels by category
  const categories = new Map();
  const uncategorizedChannels = [];
  
  // First, identify all categories
  channels.forEach(channel => {
    if (channel.type === ChannelType.GuildCategory) {
      categories.set(channel.id, {
        category: channel,
        channels: []
      });
    }
  });
  
  // Then, assign channels to their categories
  channels.forEach(channel => {
    if (channel.type !== ChannelType.GuildCategory) {
      if (channel.parentId && categories.has(channel.parentId)) {
        categories.get(channel.parentId).channels.push(channel);
      } else {
        uncategorizedChannels.push(channel);
      }
    }
  });
  
  // Create an embed to display the channels
  const embed = new EmbedBuilder()
    .setTitle('📋 Server Channels')
    .setColor('#3498db')
    .setDescription('Here are all the channels in this server, organized by category:')
    .setTimestamp();
  
  // Add fields for each category and its channels
  let totalText = '';
  
  // First add uncategorized channels if any
  if (uncategorizedChannels.length > 0) {
    let uncategorizedText = '**Uncategorized Channels:**\n';
    
    uncategorizedChannels.forEach(channel => {
      const typeName = getChannelTypeName(channel.type);
      uncategorizedText += `${channel.name} (${channel.id})\n`;
      uncategorizedText += `> Type: ${typeName}\n\n`;
    });
    
    totalText += uncategorizedText + '\n';
  }
  
  // Then add categories and their channels
  categories.forEach(({ category, channels: categoryChannels }) => {
    let categoryText = `**Category: ${category.name} (${category.id})**\n`;
    
    if (categoryChannels.length === 0) {
      categoryText += '> No channels in this category\n';
    } else {
      categoryChannels.sort((a, b) => a.position - b.position).forEach(channel => {
        const typeName = getChannelTypeName(channel.type);
        categoryText += `${channel.name} (${channel.id})\n`;
        categoryText += `> Type: ${typeName} | Position: ${channel.position}\n\n`;
      });
    }
    
    totalText += categoryText + '\n';
  });
  
  // Split the channels text into chunks if it's too long
  const maxLength = 4000; // Maximum length for embed description
  
  if (totalText.length <= maxLength) {
    embed.setDescription(`Here are all the channels in this server, organized by category:\n\n${totalText}`);
  } else {
    embed.setDescription('Here are all the channels in this server, organized by category:');
    
    // Split the text into chunks for fields
    const chunks = [];
    let currentChunk = '';
    
    // First add uncategorized channels if any
    if (uncategorizedChannels.length > 0) {
      let uncategorizedText = '**Uncategorized Channels:**\n';
      
      uncategorizedChannels.forEach(channel => {
        const typeName = getChannelTypeName(channel.type);
        const channelText = `${channel.name} (${channel.id})\n` +
                           `> Type: ${typeName}\n\n`;
        
        if (currentChunk.length + channelText.length > 1024) {
          chunks.push(currentChunk);
          currentChunk = channelText;
        } else {
          currentChunk += channelText;
        }
      });
      
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
    }
    
    // Then add categories and their channels
    categories.forEach(({ category, channels: categoryChannels }) => {
      let categoryText = `**Category: ${category.name} (${category.id})**\n`;
      
      if (categoryChannels.length === 0) {
        categoryText += '> No channels in this category\n\n';
        
        if (currentChunk.length + categoryText.length > 1024) {
          chunks.push(currentChunk);
          currentChunk = categoryText;
        } else {
          currentChunk += categoryText;
        }
      } else {
        if (currentChunk.length + categoryText.length > 1024) {
          chunks.push(currentChunk);
          currentChunk = categoryText;
        } else {
          currentChunk += categoryText;
        }
        
        categoryChannels.sort((a, b) => a.position - b.position).forEach(channel => {
          const typeName = getChannelTypeName(channel.type);
          const channelText = `${channel.name} (${channel.id})\n` +
                             `> Type: ${typeName} | Position: ${channel.position}\n\n`;
          
          if (currentChunk.length + channelText.length > 1024) {
            chunks.push(currentChunk);
            currentChunk = channelText;
          } else {
            currentChunk += channelText;
          }
        });
      }
    });
    
    // Add the last chunk if it's not empty
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    // Add fields for each chunk
    chunks.forEach((chunk, index) => {
      embed.addFields({ name: `Channels (Part ${index + 1})`, value: chunk });
    });
  }
  
  // Create buttons for channel management
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_channel')
        .setLabel('Create Channel')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('delete_channel')
        .setLabel('Delete Channel')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('move_channel')
        .setLabel('Move Channel')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('↕️')
    );
  
  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('channel_permissions')
        .setLabel('Manage Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId('bulk_channel_operations')
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