import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionsBitField } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'manage_role_permissions';

// Helper function to get permission categories
function getPermissionCategories() {
  return [
    {
      name: 'Общие права',
      permissions: [
        'ViewChannel', 'CreateInstantInvite', 'ChangeNickname', 'SendMessages', 
        'EmbedLinks', 'AttachFiles', 'AddReactions', 'UseExternalEmojis', 
        'UseExternalStickers', 'ReadMessageHistory', 'Connect', 'Speak', 
        'Stream', 'UseVAD', 'UseApplicationCommands', 'RequestToSpeak',
        'CreatePublicThreads', 'CreatePrivateThreads', 'SendMessagesInThreads'
      ]
    },
    {
      name: 'Права модерации',
      permissions: [
        'KickMembers', 'BanMembers', 'ManageNicknames', 'ModerateMembers',
        'ManageEvents', 'ManageThreads', 'ManageMessages', 'MuteMembers',
        'DeafenMembers', 'MoveMembers', 'ManageEmojisAndStickers'
      ]
    },
    {
      name: 'Права администратора',
      permissions: [
        'Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels',
        'ManageWebhooks', 'ViewAuditLog', 'ViewGuildInsights', 'MentionEveryone'
      ]
    }
  ];
}

// Helper function to get permission name in Russian
function getPermissionName(permission) {
  const permissionNames = {
    'ViewChannel': 'Просмотр каналов',
    'CreateInstantInvite': 'Создание приглашений',
    'ChangeNickname': 'Изменение никнейма',
    'SendMessages': 'Отправка сообщений',
    'EmbedLinks': 'Встраивание ссылок',
    'AttachFiles': 'Прикрепление файлов',
    'AddReactions': 'Добавление реакций',
    'UseExternalEmojis': 'Использование внешних эмодзи',
    'UseExternalStickers': 'Использование внешних стикеров',
    'ReadMessageHistory': 'Чтение истории сообщений',
    'Connect': 'Подключение к голосовым каналам',
    'Speak': 'Разговор в голосовых каналах',
    'Stream': 'Видеотрансляция',
    'UseVAD': 'Использование активации по голосу',
    'UseApplicationCommands': 'Использование команд приложений',
    'RequestToSpeak': 'Запрос на выступление',
    'CreatePublicThreads': 'Создание публичных тредов',
    'CreatePrivateThreads': 'Создание приватных тредов',
    'SendMessagesInThreads': 'Отправка сообщений в тредах',
    'KickMembers': 'Исключение участников',
    'BanMembers': 'Блокировка участников',
    'ManageNicknames': 'Управление никнеймами',
    'ModerateMembers': 'Модерация участников',
    'ManageEvents': 'Управление событиями',
    'ManageThreads': 'Управление тредами',
    'ManageMessages': 'Управление сообщениями',
    'MuteMembers': 'Отключение микрофона участникам',
    'DeafenMembers': 'Отключение звука участникам',
    'MoveMembers': 'Перемещение участников',
    'ManageEmojisAndStickers': 'Управление эмодзи и стикерами',
    'Administrator': 'Администратор',
    'ManageGuild': 'Управление сервером',
    'ManageRoles': 'Управление ролями',
    'ManageChannels': 'Управление каналами',
    'ManageWebhooks': 'Управление вебхуками',
    'ViewAuditLog': 'Просмотр журнала аудита',
    'ViewGuildInsights': 'Просмотр аналитики сервера',
    'MentionEveryone': 'Упоминание @everyone и @here'
  };
  
  return permissionNames[permission] || permission;
}

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  try {
    // Get the role ID from the custom ID
    const roleId = interaction.customId.split(':')[1];
    
    // Fetch the role
    const role = await interaction.guild.roles.fetch(roleId);
    
    if (!role) {
      return await interaction.update({
        embeds: [createErrorEmbed('Ошибка', 'Выбранная роль не найдена. Возможно, она была удалена.')],
        components: [],
        ephemeral: true
      });
    }
    
    // Create an embed with role permissions information
    const embed = new EmbedBuilder()
      .setTitle(`🔒 Управление правами роли: ${role.name}`)
      .setColor(role.color || '#3498db')
      .setDescription(`Выберите категорию прав для роли **${role.name}**`)
      .addFields(
        { name: 'Текущие права', value: 
          role.permissions.has(PermissionsBitField.Flags.Administrator) ? 
            '**Администратор** (все права включены)' : 
            Object.keys(PermissionsBitField.Flags)
              .filter(perm => role.permissions.has(PermissionsBitField.Flags[perm]))
              .map(perm => `• ${getPermissionName(perm)}`)
              .join('\n') || 'Нет прав'
        }
      )
      .setTimestamp();
    
    // Create a select menu for permission categories
    const categories = getPermissionCategories();
    const selectOptions = categories.map(category => ({
      label: category.name,
      description: `Управление правами категории "${category.name}"`,
      value: `role_perm_category:${roleId}:${category.name}`
    }));
    
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('role_permissions_category_select')
      .setPlaceholder('Выберите категорию прав')
      .addOptions(selectOptions);
    
    const selectRow = new ActionRowBuilder().addComponents(selectMenu);
    
    // Create buttons for quick actions
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`reset_role_permissions:${roleId}`)
          .setLabel('Сбросить все права')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔄'),
        new ButtonBuilder()
          .setCustomId(`toggle_admin_permission:${roleId}`)
          .setLabel(role.permissions.has(PermissionsBitField.Flags.Administrator) ? 
            'Отключить права администратора' : 'Включить права администратора')
          .setStyle(role.permissions.has(PermissionsBitField.Flags.Administrator) ? 
            ButtonStyle.Danger : ButtonStyle.Success)
          .setEmoji('⚡')
      );
    
    // Create a back button to return to role management
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manage_role:${roleId}`)
          .setLabel('Назад к управлению ролью')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );
    
    // Update the message with the new embed and components
    await interaction.update({
      embeds: [embed],
      components: [selectRow, row1, row2],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error in manageRolePermissions:', error);
    
    await interaction.update({
      embeds: [createErrorEmbed('Ошибка', `Произошла ошибка при управлении правами роли: ${error.message}`)],
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('view_roles')
              .setLabel('Назад к списку ролей')
              .setStyle(ButtonStyle.Secondary)
              .setEmoji('◀️')
          )
      ],
      ephemeral: true
    });
  }
}