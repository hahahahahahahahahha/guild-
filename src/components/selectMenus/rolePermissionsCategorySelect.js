import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'role_permissions_category_select';

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
    // Get the selected value (format: role_perm_category:roleId:categoryName)
    const selectedValue = interaction.values[0];
    const [_, roleId, ...categoryNameParts] = selectedValue.split(':');
    const categoryName = categoryNameParts.join(':');
    
    // Fetch the role
    const role = await interaction.guild.roles.fetch(roleId);
    
    if (!role) {
      return await interaction.update({
        embeds: [createErrorEmbed('Ошибка', 'Выбранная роль не найдена. Возможно, она была удалена.')],
        components: [],
        ephemeral: true
      });
    }
    
    // Find the selected category
    const categories = getPermissionCategories();
    const category = categories.find(cat => cat.name === categoryName);
    
    if (!category) {
      return await interaction.update({
        embeds: [createErrorEmbed('Ошибка', 'Выбранная категория прав не найдена.')],
        components: [],
        ephemeral: true
      });
    }
    
    // Create an embed with the permissions in this category
    const embed = new EmbedBuilder()
      .setTitle(`🔒 Права роли: ${role.name} - ${categoryName}`)
      .setColor(role.color || '#3498db')
      .setDescription(`Управление правами категории **${categoryName}** для роли **${role.name}**\n\nНажмите на кнопки ниже, чтобы включить или отключить соответствующие права.`)
      .setTimestamp();
    
    // Create buttons for each permission in the category
    const permissionRows = [];
    let currentRow = new ActionRowBuilder();
    let buttonCount = 0;
    
    for (const permission of category.permissions) {
      // Check if the role has this permission
      const hasPermission = role.permissions.has(PermissionsBitField.Flags[permission]);
      
      // Create a button for this permission
      const button = new ButtonBuilder()
        .setCustomId(`toggle_role_permission:${roleId}:${permission}`)
        .setLabel(getPermissionName(permission))
        .setStyle(hasPermission ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setEmoji(hasPermission ? '✅' : '❌');
      
      // Add the button to the current row
      currentRow.addComponents(button);
      buttonCount++;
      
      // If we've added 3 buttons to this row, start a new row
      if (buttonCount % 3 === 0) {
        permissionRows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
    }
    
    // Add the last row if it has any buttons
    if (currentRow.components.length > 0) {
      permissionRows.push(currentRow);
    }
    
    // Create a back button to return to role permissions management
    const backRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manage_role_permissions:${roleId}`)
          .setLabel('Назад к категориям прав')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );
    
    // Add the back row to the permission rows
    permissionRows.push(backRow);
    
    // Update the message with the new embed and components
    await interaction.update({
      embeds: [embed],
      components: permissionRows,
      ephemeral: true
    });
  } catch (error) {
    console.error('Error in rolePermissionsCategorySelect:', error);
    
    await interaction.update({
      embeds: [createErrorEmbed('Ошибка', `Произошла ошибка при выборе категории прав: ${error.message}`)],
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