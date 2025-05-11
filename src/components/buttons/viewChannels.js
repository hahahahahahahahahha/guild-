import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, StringSelectMenuBuilder } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'view_channels';

// Helper function to get channel type name
function getChannelTypeName(type) {
  const typeMap = {
    [ChannelType.GuildText]: 'Текстовый',
    [ChannelType.GuildVoice]: 'Голосовой',
    [ChannelType.GuildCategory]: 'Категория',
    [ChannelType.GuildAnnouncement]: 'Новостной',
    [ChannelType.GuildForum]: 'Форум',
    [ChannelType.GuildStageVoice]: 'Сцена',
    [ChannelType.PublicThread]: 'Публичный тред',
    [ChannelType.PrivateThread]: 'Приватный тред',
    [ChannelType.AnnouncementThread]: 'Новостной тред'
  };
  
  return typeMap[type] || 'Неизвестный';
}

// Helper function to get emoji based on channel type
function getChannelTypeEmoji(type) {
  const emojiMap = {
    [ChannelType.GuildText]: '💬',
    [ChannelType.GuildVoice]: '🔊',
    [ChannelType.GuildCategory]: '📁',
    [ChannelType.GuildAnnouncement]: '📢',
    [ChannelType.GuildForum]: '📋',
    [ChannelType.GuildStageVoice]: '🎭',
    [ChannelType.PublicThread]: '🧵',
    [ChannelType.PrivateThread]: '🔒',
    [ChannelType.AnnouncementThread]: '📣'
  };
  
  return emojiMap[type] || '📝';
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
    .setTitle('📋 Управление каналами сервера')
    .setColor('#3498db')
    .setDescription('Здесь вы можете просматривать и управлять каналами сервера.\n\n**Выберите канал из списка ниже для управления:**')
    .setTimestamp();
  
  // Create select menu options for channel management
  const selectOptions = [];
  
  // Add options for uncategorized channels
  uncategorizedChannels.forEach(channel => {
    // Skip threads
    if (channel.type === ChannelType.PublicThread || 
        channel.type === ChannelType.PrivateThread || 
        channel.type === ChannelType.AnnouncementThread) {
      return;
    }
    
    const channelEmoji = getChannelTypeEmoji(channel.type);
    selectOptions.push({
      label: channel.name,
      description: `Тип: ${getChannelTypeName(channel.type)} | Без категории`,
      value: `manage_channel:${channel.id}`,
      emoji: channelEmoji
    });
  });
  
  // Add options for categorized channels
  categories.forEach(({ category, channels: categoryChannels }) => {
    // Sort channels by position
    const sortedChannels = categoryChannels.sort((a, b) => a.position - b.position);
    
    sortedChannels.forEach(channel => {
      // Skip threads
      if (channel.type === ChannelType.PublicThread || 
          channel.type === ChannelType.PrivateThread || 
          channel.type === ChannelType.AnnouncementThread) {
        return;
      }
      
      const channelEmoji = getChannelTypeEmoji(channel.type);
      selectOptions.push({
        label: channel.name,
        description: `Тип: ${getChannelTypeName(channel.type)} | Категория: ${category.name}`,
        value: `manage_channel:${channel.id}`,
        emoji: channelEmoji
      });
    });
  });
  
  // Limit options to 25 due to Discord API limitations
  const limitedOptions = selectOptions.slice(0, 25);
  
  // Create a select menu for channel management
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('manage_channel_select')
    .setPlaceholder('Выберите канал для управления')
    .addOptions(limitedOptions);
  
  const selectRow = new ActionRowBuilder().addComponents(selectMenu);
  
  // Add channel information to the embed
  let channelsInfo = '';
  
  // Add uncategorized channels first if any
  if (uncategorizedChannels.length > 0) {
    channelsInfo += '**Каналы без категории:**\n';
    
    let count = 0;
    for (const channel of uncategorizedChannels) {
      // Skip threads and limit to 5 channels
      if ((channel.type === ChannelType.PublicThread || 
           channel.type === ChannelType.PrivateThread || 
           channel.type === ChannelType.AnnouncementThread) || count >= 5) {
        continue;
      }
      
      const channelEmoji = getChannelTypeEmoji(channel.type);
      channelsInfo += `${channelEmoji} **${channel.name}**\n`;
      count++;
    }
    
    if (uncategorizedChannels.length > 5) {
      channelsInfo += `*...и еще ${uncategorizedChannels.length - 5} каналов без категории*\n`;
    }
    
    channelsInfo += '\n';
  }
  
  // Add categories and their channels
  let categoryCount = 0;
  for (const [categoryId, { category, channels: categoryChannels }] of categories) {
    if (categoryCount >= 3) break; // Limit to 3 categories
    
    channelsInfo += `**📁 ${category.name}:**\n`;
    
    // Sort channels by position
    const sortedChannels = categoryChannels.sort((a, b) => a.position - b.position);
    
    let channelCount = 0;
    for (const channel of sortedChannels) {
      // Skip threads and limit to 3 channels per category
      if ((channel.type === ChannelType.PublicThread || 
           channel.type === ChannelType.PrivateThread || 
           channel.type === ChannelType.AnnouncementThread) || channelCount >= 3) {
        continue;
      }
      
      const channelEmoji = getChannelTypeEmoji(channel.type);
      channelsInfo += `${channelEmoji} **${channel.name}**\n`;
      channelCount++;
    }
    
    if (sortedChannels.length > 3) {
      channelsInfo += `*...и еще ${sortedChannels.length - 3} каналов в этой категории*\n`;
    }
    
    channelsInfo += '\n';
    categoryCount++;
  }
  
  if (categories.size > 3) {
    channelsInfo += `*...и еще ${categories.size - 3} категорий*\n`;
  }
  
  embed.setDescription(`Здесь вы можете просматривать и управлять каналами сервера.\n\n**Выберите канал из списка ниже для управления:**\n\n${channelsInfo}`);
  
  // Create buttons for channel management
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_channel')
        .setLabel('Создать канал')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('delete_channel')
        .setLabel('Удалить канал')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('move_channel')
        .setLabel('Переместить канал')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('↕️')
    );
  
  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('channel_permissions')
        .setLabel('Управление правами')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔐'),
      new ButtonBuilder()
        .setCustomId('bulk_channel_operations')
        .setLabel('Массовые операции')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋')
    );
  
  // Create a back button to return to the main panel
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_panel')
        .setLabel('Назад в главное меню')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );
  
  // Send the embed with the select menu and buttons
  await interaction.reply({
    embeds: [embed],
    components: [selectRow, row, row2, row3],
    ephemeral: true
  });
}