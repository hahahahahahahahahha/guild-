import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed, createProgressEmbed, createPanelEmbed } from '../../utils/embeds.js';

export const customId = 'confirm_bulk_delete_channels';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Extract the channel IDs from the custom ID
  const channelIds = interaction.customId.split(':')[1].split(',');
  
  // Send an initial response
  await interaction.reply({
    embeds: [createProgressEmbed('Deleting Channels', `Starting to delete ${channelIds.length} channels...`)],
    ephemeral: true
  });

  // Delete the channels
  const deletedChannels = [];
  const failedChannels = [];

  for (let i = 0; i < channelIds.length; i++) {
    const channelId = channelIds[i];
    
    try {
      // Fetch the channel
      const channel = await interaction.guild.channels.fetch(channelId);
      
      if (!channel) {
        failedChannels.push({ id: channelId, name: 'Unknown Channel', error: 'Channel not found' });
        continue;
      }
      
      const channelName = channel.name;
      
      // Delete the channel
      await channel.delete(`Bulk channel deletion by ${interaction.user.tag}`);
      
      deletedChannels.push({ id: channelId, name: channelName });
      
      // Update the progress
      await interaction.editReply({
        embeds: [createProgressEmbed(
          'Deleting Channels',
          `Progress: ${i + 1}/${channelIds.length} channels deleted\n\n` +
          `Last deleted: **${channelName}**`
        )],
        ephemeral: true
      });
    } catch (error) {
      console.error(`Error deleting channel ${channelId}:`, error);
      
      // Try to get the channel name
      let channelName = 'Unknown Channel';
      try {
        const channel = await interaction.guild.channels.fetch(channelId);
        if (channel) {
          channelName = channel.name;
        }
      } catch {}
      
      failedChannels.push({ id: channelId, name: channelName, error: error.message });
    }
  }

  // Create a final embed with the results
  const embed = new EmbedBuilder()
    .setTitle('Bulk Channel Deletion Results')
    .setColor(deletedChannels.length > 0 ? '#00FF00' : '#FF0000')
    .setDescription(
      `**Successfully deleted ${deletedChannels.length}/${channelIds.length} channels**\n\n` +
      (deletedChannels.length > 0 ? `**Deleted Channels:**\n${deletedChannels.map(channel => `• ${channel.name}`).join('\n')}\n\n` : '') +
      (failedChannels.length > 0 ? `**Failed Channels:**\n${failedChannels.map(channel => `• ${channel.name}: ${channel.error}`).join('\n')}` : '')
    )
    .setTimestamp();

  // Send the final results
  await interaction.editReply({
    embeds: [embed],
    ephemeral: true
  });

  // Update the original message to show the channel management menu
  const channelManagementEmbed = createPanelEmbed(
    'Channel Management',
    '> Select an action to manage channels on this server.\n\n' +
    '**Available Actions:**\n' +
    '• Create a new channel with custom name, type, and category\n' +
    '• Delete an existing channel\n' +
    '• Move a channel up or down in the list\n' +
    '• Bulk channel operations\n' +
    '• Manage channel permissions'
  );

  // Create buttons for channel management
  const row1 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_channel')
        .setLabel('Create Channel')
        .setStyle(ButtonStyle.Success)
        .setEmoji('➕'),
      new ButtonBuilder()
        .setCustomId('delete_channel')
        .setLabel('Delete Channel')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('move_channel')
        .setLabel('Move Channel')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('↕️')
    );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('bulk_create_channels')
        .setLabel('Bulk Create')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('bulk_delete_channels')
        .setLabel('Bulk Delete')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🗑️'),
      new ButtonBuilder()
        .setCustomId('channel_permissions')
        .setLabel('Manage Permissions')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔒')
    );

  // Create a back button to return to the main panel
  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('back_to_panel')
        .setLabel('Back to Main Panel')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('◀️')
    );

  // Update the original message
  await interaction.message.edit({
    embeds: [channelManagementEmbed],
    components: [row1, row2, row3]
  });
}