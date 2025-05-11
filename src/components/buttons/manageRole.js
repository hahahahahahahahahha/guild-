import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'manage_role';

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
    
    // Create an embed with role information
    const embed = new EmbedBuilder()
      .setTitle(`🔧 Управление ролью: ${role.name}`)
      .setColor(role.color || '#3498db')
      .setDescription(`Выберите действие для управления ролью **${role.name}**`)
      .addFields(
        { name: 'Информация о роли', value: 
          `**ID:** ${role.id}\n` +
          `**Позиция:** ${role.position}\n` +
          `**Цвет:** ${role.hexColor}\n` +
          `**Участников с ролью:** ${role.members.size}\n` +
          `**Упоминаемая:** ${role.mentionable ? '✅' : '❌'}\n` +
          `**Отображаемая:** ${role.hoist ? '✅' : '❌'}\n` +
          `**Управляемая интеграцией:** ${role.managed ? '✅' : '❌'}`
        }
      )
      .setTimestamp();
    
    // Create buttons for role management
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`edit_role_name:${role.id}`)
          .setLabel('Изменить название')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('✏️'),
        new ButtonBuilder()
          .setCustomId(`edit_role_color:${role.id}`)
          .setLabel('Изменить цвет')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎨'),
        new ButtonBuilder()
          .setCustomId(`toggle_role_hoisted:${role.id}`)
          .setLabel(role.hoist ? 'Скрыть в списке' : 'Показать в списке')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(role.hoist ? '👁️' : '👁️‍🗨️')
      );
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`toggle_role_mentionable:${role.id}`)
          .setLabel(role.mentionable ? 'Запретить упоминания' : 'Разрешить упоминания')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(role.mentionable ? '🔔' : '🔕'),
        new ButtonBuilder()
          .setCustomId(`move_role_up:${role.id}`)
          .setLabel('Переместить вверх')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬆️'),
        new ButtonBuilder()
          .setCustomId(`move_role_down:${role.id}`)
          .setLabel('Переместить вниз')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬇️')
      );
    
    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manage_role_permissions:${role.id}`)
          .setLabel('Управление правами')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔒'),
        new ButtonBuilder()
          .setCustomId(`delete_specific_role:${role.id}`)
          .setLabel('Удалить роль')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🗑️')
      );
    
    const row4 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('view_roles')
          .setLabel('Назад к списку ролей')
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
    console.error('Error in manageRole:', error);
    
    await interaction.update({
      embeds: [createErrorEmbed('Ошибка', `Произошла ошибка при управлении ролью: ${error.message}`)],
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