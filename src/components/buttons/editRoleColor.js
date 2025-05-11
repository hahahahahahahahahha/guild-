import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'edit_role_color';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the role ID from the custom ID
  const roleId = interaction.customId.split(':')[1];
  
  // Fetch the role
  const role = await interaction.guild.roles.fetch(roleId);
  
  if (!role) {
    return await interaction.reply({
      content: 'Роль не найдена. Возможно, она была удалена.',
      ephemeral: true
    });
  }
  
  // Create a modal for editing the role color
  const modal = new ModalBuilder()
    .setCustomId(`edit_role_color_modal:${roleId}`)
    .setTitle(`Изменить цвет роли: ${role.name}`);
  
  // Create a text input for the new role color
  const colorInput = new TextInputBuilder()
    .setCustomId('role_color')
    .setLabel('Новый цвет роли (HEX формат)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Например: #FF0000 или RED')
    .setValue(role.hexColor)
    .setRequired(true)
    .setMaxLength(7);
  
  // Add the text input to the modal
  const firstActionRow = new ActionRowBuilder().addComponents(colorInput);
  modal.addComponents(firstActionRow);
  
  // Show the modal
  await interaction.showModal(modal);
}