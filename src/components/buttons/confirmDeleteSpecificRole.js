import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createLoadingEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'confirm_delete_specific_role';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the role ID from the custom ID
  const roleId = interaction.customId.split(':')[1];
  
  // Send a loading message
  await interaction.update({
    embeds: [createLoadingEmbed('Удаление роли...')],
    components: [],
    ephemeral: true
  });
  
  try {
    // Fetch the role
    const role = await interaction.guild.roles.fetch(roleId);
    
    if (!role) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Ошибка', 'Выбранная роль не найдена. Возможно, она была удалена.')],
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
    
    // Store role info for the success message
    const roleName = role.name;
    const roleColor = role.hexColor;
    
    // Delete the role
    await role.delete(`Удалено администратором ${interaction.user.tag}`);
    
    // Create a success embed
    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Роль удалена')
      .setColor('#2ecc71')
      .setDescription(`Роль **${roleName}** (${roleColor}) успешно удалена.`)
      .setTimestamp();
    
    // Create a button to go back to role list
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('view_roles')
          .setLabel('Назад к списку ролей')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('◀️')
      );
    
    // Update the reply with the success message
    await interaction.editReply({
      embeds: [successEmbed],
      components: [row],
      ephemeral: true
    });
  } catch (error) {
    console.error('Error in confirmDeleteSpecificRole:', error);
    
    // Create an error embed
    const errorEmbed = createErrorEmbed(
      'Ошибка при удалении роли',
      `Произошла ошибка: ${error.message}\n` +
      'Убедитесь, что у бота есть необходимые права и попробуйте снова.'
    );
    
    // Create a button to go back to role management
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('view_roles')
          .setLabel('Назад к списку ролей')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('◀️')
      );
    
    // Update the reply with the error message
    await interaction.editReply({
      embeds: [errorEmbed],
      components: [row],
      ephemeral: true
    });
  }
}