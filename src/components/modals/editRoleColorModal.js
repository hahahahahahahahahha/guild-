import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createLoadingEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'edit_role_color_modal';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the role ID from the custom ID
  const roleId = interaction.customId.split(':')[1];
  
  // Get the new role color from the modal
  let newRoleColor = interaction.fields.getTextInputValue('role_color');
  
  // Send a loading message
  await interaction.reply({
    embeds: [createLoadingEmbed('Изменение цвета роли...')],
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
    
    // Store the old color for the success message
    const oldColor = role.hexColor;
    
    // Validate and format the color
    if (!newRoleColor.startsWith('#') && newRoleColor.toLowerCase() !== 'default') {
      newRoleColor = `#${newRoleColor}`;
    }
    
    // Update the role color
    await role.setColor(newRoleColor === 'DEFAULT' || newRoleColor.toLowerCase() === 'default' ? 'DEFAULT' : newRoleColor, 
      `Изменено администратором ${interaction.user.tag}`);
    
    // Create a success embed
    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Цвет роли изменен')
      .setColor(newRoleColor === 'DEFAULT' || newRoleColor.toLowerCase() === 'default' ? '#000000' : newRoleColor)
      .setDescription(`Цвет роли **${role.name}** успешно изменен с **${oldColor}** на **${role.hexColor}**`)
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
    console.error('Error in editRoleColorModal:', error);
    
    // Create an error embed
    const errorEmbed = createErrorEmbed(
      'Ошибка при изменении цвета роли',
      `Произошла ошибка: ${error.message}\n\nУбедитесь, что вы указали правильный формат цвета (например, #FF0000 или RED)`
    );
    
    // Update the reply with the error message
    await interaction.editReply({
      embeds: [errorEmbed],
      components: [],
      ephemeral: true
    });
  }
}