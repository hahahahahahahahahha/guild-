import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createLoadingEmbed, createErrorEmbed } from '../../utils/embeds.js';

export const customId = 'edit_role_name_modal';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the role ID from the custom ID
  const roleId = interaction.customId.split(':')[1];
  
  // Get the new role name from the modal
  const newRoleName = interaction.fields.getTextInputValue('role_name');
  
  // Send a loading message
  await interaction.reply({
    embeds: [createLoadingEmbed('Изменение названия роли...')],
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
    
    // Store the old name for the success message
    const oldName = role.name;
    
    // Update the role name
    await role.setName(newRoleName, `Изменено администратором ${interaction.user.tag}`);
    
    // Create a success embed
    const successEmbed = new EmbedBuilder()
      .setTitle('✅ Название роли изменено')
      .setColor('#2ecc71')
      .setDescription(`Название роли успешно изменено с **${oldName}** на **${newRoleName}**`)
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
    console.error('Error in editRoleNameModal:', error);
    
    // Create an error embed
    const errorEmbed = createErrorEmbed(
      'Ошибка при изменении названия роли',
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