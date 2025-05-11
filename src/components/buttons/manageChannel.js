import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'manage_channel';

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

  try {
    // Get the channel ID from the custom ID
    const channelId = interaction.customId.split(':')[1];
    
    // Fetch the channel
    const channel = await interaction.guild.channels.fetch(channelId);
    
    if (!channel) {
      return await interaction.update({
        embeds: [createErrorEmbed('Ошибка', 'Выбранный канал не найден. Возможно, он был удален.')],
        components: [],
        ephemeral: true
      });
    }
    
    // Get parent category if exists
    let parentCategory = null;
    if (channel.parentId) {
      parentCategory = await interaction.guild.channels.fetch(channel.parentId);
    }
    
    // Create an embed with channel information
    const embed = new EmbedBuilder()
      .setTitle(`${getChannelTypeEmoji(channel.type)} Управление каналом: ${channel.name}`)
      .setColor('#3498db')
      .setDescription(`Выберите действие для управления каналом **${channel.name}**`)
      .addFields(
        { name: 'Информация о канале', value: 
          `**ID:** ${channel.id}\n` +
          `**Тип:** ${getChannelTypeName(channel.type)}\n` +
          `**Позиция:** ${channel.position}\n` +
          `**Категория:** ${parentCategory ? parentCategory.name : 'Нет'}\n` +
          (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement ? 
            `**Медленный режим:** ${channel.rateLimitPerUser ? `${channel.rateLimitPerUser} сек.` : 'Выключен'}\n` : '') +
          (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice ? 
            `**Битрейт:** ${channel.bitrate / 1000} Кбит/с\n` +
            `**Лимит пользователей:** ${channel.userLimit || 'Не ограничен'}\n` : '')
        }
      )
      .setTimestamp();
    
    // Create buttons for channel management
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`edit_channel_name:${channel.id}`)
          .setLabel('Изменить название')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('✏️'),
        new ButtonBuilder()
          .setCustomId(`edit_channel_topic:${channel.id}`)
          .setLabel('Изменить описание')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📝'),
        new ButtonBuilder()
          .setCustomId(`edit_channel_category:${channel.id}`)
          .setLabel('Изменить категорию')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📁')
      );
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`move_channel_up:${channel.id}`)
          .setLabel('Переместить вверх')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬆️'),
        new ButtonBuilder()
          .setCustomId(`move_channel_down:${channel.id}`)
          .setLabel('Переместить вниз')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬇️')
      );
    
    // Add channel-specific buttons based on channel type
    if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) {
      row2.addComponents(
        new ButtonBuilder()
          .setCustomId(`edit_slowmode:${channel.id}`)
          .setLabel('Настроить медленный режим')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('⏱️')
      );
    } else if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
      row2.addComponents(
        new ButtonBuilder()
          .setCustomId(`edit_user_limit:${channel.id}`)
          .setLabel('Настроить лимит пользователей')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('👥')
      );
    }
    
    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manage_channel_permissions:${channel.id}`)
          .setLabel('Управление правами')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔐'),
        new ButtonBuilder()
          .setCustomId(`delete_specific_channel:${channel.id}`)
          .setLabel('Удалить канал')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🗑️')
      );
    
    const row4 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('view_channels')
          .setLabel('Назад к списку каналов')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );
    
    // Update the message with the new embed and components
    await interaction.update({
      embeds: [embed],
      components: [row1, row2, row3, row4],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error in manageChannel:', error);
    
    await interaction.update({
      embeds: [createErrorEmbed('Ошибка', `Произошла ошибка при управлении каналом: ${error.message}`)],
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('view_channels')
              .setLabel('Назад к списку каналов')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('◀️')
          )
      ],
      ephemeral: true
    });
  }
}