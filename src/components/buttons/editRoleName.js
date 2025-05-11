import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'edit_role_name';

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
  
  // Create a modal for editing the role name
  const modal = new ModalBuilder()
    .setCustomId(`edit_role_name_modal:${roleId}`)
    .setTitle(`Изменить название роли: ${role.name}`);
  
  // Create a text input for the new role name
  const nameInput = new TextInputBuilder()
    .setCustomId('role_name')
    .setLabel('Новое название роли')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Введите новое название роли')
    .setValue(role.name)
    .setRequired(true)
    .setMaxLength(100);
  
  // Add the text input to the modal
  const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
  modal.addComponents(firstActionRow);
  
  // Show the modal
  await interaction.showModal(modal);
}