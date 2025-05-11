import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
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
    .setTitle('📋 Управление ролями сервера')
    .setColor('#3498db')
    .setDescription('Здесь вы можете просматривать и управлять ролями сервера.\n\n**Выберите роль из списка ниже для управления:**')
    .setTimestamp();
  
  // Filter out @everyone role and roles higher than the bot's highest role
  const botRole = interaction.guild.members.me.roles.highest;
  const availableRoles = sortedRoles.filter(role => 
    !role.managed && 
    role.id !== interaction.guild.id && // Filter out @everyone
    role.position < botRole.position // Filter out roles higher than the bot's highest role
  );
  
  // Create select menu options (limit to 25 due to Discord API limitations)
  const selectOptions = availableRoles.slice(0, 25).map(role => {
    const hexColor = role.hexColor === '#000000' ? 'Default' : role.hexColor;
    return {
      label: role.name,
      description: `Позиция: ${role.position} | Цвет: ${hexColor}`,
      value: `manage_role:${role.id}`,
      emoji: '👑'
    };
  });
  
  // Create a select menu for role management
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('manage_role_select')
    .setPlaceholder('Выберите роль для управления')
    .addOptions(selectOptions);
  
  const selectRow = new ActionRowBuilder().addComponents(selectMenu);
  
  // Create buttons for role management
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_role')
        .setLabel('Создать роль')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('delete_role')
        .setLabel('Удалить роль')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('move_role')
        .setLabel('Переместить роль')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('↕️')
    );
  
  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('role_permissions')
        .setLabel('Управление правами')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔒'),
      new ButtonBuilder()
        .setCustomId('bulk_role_operations')
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
  
  // Add information about roles to the embed
  let rolesInfo = '';
  let count = 0;
  
  for (const role of sortedRoles) {
    // Skip @everyone role
    if (role.name === '@everyone') continue;
    
    // Limit to 15 roles in the description to avoid it being too long
    if (count >= 15) break;
    
    const hexColor = role.hexColor === '#000000' ? 'Default' : role.hexColor;
    const memberCount = role.members.size;
    
    rolesInfo += `**${role.position}.** ${role.name}\n`;
    rolesInfo += `> Цвет: ${hexColor} | Участников: ${memberCount}\n`;
    rolesInfo += `> Упоминаемая: ${role.mentionable ? '✅' : '❌'} | Отображаемая: ${role.hoist ? '✅' : '❌'}\n\n`;
    
    count++;
  }
  
  if (sortedRoles.length > 15) {
    rolesInfo += `*...и еще ${sortedRoles.length - 15} ролей*`;
  }
  
  embed.setDescription(`Здесь вы можете просматривать и управлять ролями сервера.\n\n**Выберите роль из списка ниже для управления:**\n\n${rolesInfo}`);
  
  // Send the embed with the select menu and buttons
  await interaction.reply({
    embeds: [embed],
    components: [selectRow, row, row2, row3],
    ephemeral: true
  });
}