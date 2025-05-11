import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createLoadingEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'toggle_role_mentionable';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the role ID from the custom ID
  const roleId = interaction.customId.split(':')[1];
  
  // Send a loading message
  await interaction.reply({
    embeds: [createLoadingEmbed('Изменение возможности упоминания роли...')],
    ephemeral: true
  });
  
  try {
    // Fetch the role
    const role = await interaction.guild.roles.fetch(roleId);
    
    if (!role) {
      return await interaction.editReply({
        embeds: [createErrorEmbed('Ошибка', 'Роль не найдена. Возможно, она была удалена.')],
        components: [],
        ephemeral: true
      });
    }
    
    // Toggle the mentionable status
    const newMentionableStatus = !role.mentionable;
    await role.setMentionable(newMentionableStatus, `Изменено администратором ${interaction.user.tag}`);
    
    // Create a success embed
    const successEmbed = new EmbedBuilder()
      .setTitle(`✅ Упоминание роли ${newMentionableStatus ? 'разрешено' : 'запрещено'}`)
      .setColor(role.color || '#2ecc71')
      .setDescription(
        `Роль **${role.name}** теперь ${newMentionableStatus ? 'может' : 'не может'} быть упомянута участниками сервера.`
      )
      .setTimestamp();
    
    // Create a button to go back to role management
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`manage_role:${roleId}`)
          .setLabel('Вернуться к управлению ролью')
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
    console.error('Error in toggleRoleMentionable:', error);
    
    // Create an error embed
    const errorEmbed = createErrorEmbed(
      'Ошибка при изменении возможности упоминания роли',
      `Произошла ошибка: ${error.message}`
    );
    
    // Update the reply with the error message
    await interaction.editReply({
      embeds: [errorEmbed],
      components: [],
      ephemeral: true
    });
  }
}