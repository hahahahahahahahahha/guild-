import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'bulk_delete_channels_select';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the selected channel IDs
  const selectedChannelIds = interaction.values;
  
  // Fetch the channels
  const selectedChannels = [];
  for (const channelId of selectedChannelIds) {
    const channel = await interaction.guild.channels.fetch(channelId);
    if (channel) {
      selectedChannels.push(channel);
    }
  }

  if (selectedChannels.length === 0) {
    return await interaction.reply({
      content: '❌ None of the selected channels were found. They may have been deleted.',
      ephemeral: true
    });
  }

  // Create a confirmation embed
  const embed = createPanelEmbed(
    'Confirm Bulk Channel Deletion',
    `> You are about to delete **${selectedChannels.length}** channels.\n\n` +
    `**Selected Channels:**\n${selectedChannels.map(channel => `• ${channel.name}`).join('\n')}\n\n` +
    `**Warning:** This action cannot be undone. Are you sure you want to continue?`
  );

  // Create confirmation buttons
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`confirm_bulk_delete_channels:${selectedChannelIds.join(',')}`)
        .setLabel(`Delete ${selectedChannels.length} Channels`)
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚠️'),
      new ButtonBuilder()
        .setCustomId('bulk_delete_channels')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('✖️')
    );

  // Update the message with the confirmation
  await interaction.update({
    embeds: [embed],
    components: [row]
  });
}