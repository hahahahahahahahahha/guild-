import { EmbedBuilder, ChannelType } from 'discord.js';
import { checkAdmin } from '../../utils/permissions.js';
import { createSuccessEmbed, createErrorEmbed, createLoadingEmbed } from '../../utils/embeds.js';

export const customId = 'bulk_create_channels_modal';

// Helper function to convert channel type string to ChannelType enum
const getChannelType = (typeString) => {
  const typeMap = {
    'text': ChannelType.GuildText,
    'voice': ChannelType.GuildVoice,
    'category': ChannelType.GuildCategory,
    'announcement': ChannelType.GuildAnnouncement,
    'forum': ChannelType.GuildForum,
    'stage': ChannelType.GuildStageVoice
  };
  
  return typeMap[typeString.toLowerCase()] || ChannelType.GuildText;
};

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the values from the modal
  const channelNames = interaction.fields.getTextInputValue('channel_names').split('\n').filter(name => name.trim() !== '');
  const channelTypeString = interaction.fields.getTextInputValue('channel_type').trim().toLowerCase();
  const categoryId = interaction.fields.getTextInputValue('category_id') || null;

  // Validate the channel names
  if (channelNames.length === 0) {
    return await interaction.reply({
      content: '❌ Please provide at least one channel name.',
      ephemeral: true
    });
  }

  // Validate the channel type
  const validTypes = ['text', 'voice', 'category', 'announcement', 'forum', 'stage'];
  if (!validTypes.includes(channelTypeString)) {
    return await interaction.reply({
      content: `❌ Invalid channel type. Valid types are: ${validTypes.join(', ')}.`,
      ephemeral: true
    });
  }

  // Convert the channel type string to the ChannelType enum
  const channelType = getChannelType(channelTypeString);

  // Validate the category if provided
  let category = null;
  if (categoryId) {
    try {
      category = await interaction.guild.channels.fetch(categoryId);
      if (!category || category.type !== ChannelType.GuildCategory) {
        return await interaction.reply({
          content: '❌ Invalid category ID. Please provide a valid category ID.',
          ephemeral: true
        });
      }
    } catch (error) {
      return await interaction.reply({
        content: `❌ Error fetching category: ${error.message}`,
        ephemeral: true
      });
    }
  }

  // Send an initial response
  await interaction.reply({
    embeds: [createLoadingEmbed('Creating Channels', `Starting to create ${channelNames.length} channels...`)],
    ephemeral: true
  });

  // Create the channels
  const createdChannels = [];
  const failedChannels = [];

  for (let i = 0; i < channelNames.length; i++) {
    const name = channelNames[i].trim();
    
    try {
      // Create the channel
      const channel = await interaction.guild.channels.create({
        name: name,
        type: channelType,
        parent: category,
        reason: `Bulk channel creation by ${interaction.user.tag}`
      });
      
      createdChannels.push(channel);
      
      // Update the progress
      await interaction.editReply({
        embeds: [createLoadingEmbed(
          'Creating Channels',
          `Progress: ${i + 1}/${channelNames.length} channels created\n\n` +
          `Last created: **${channel.name}** (${channel.id})`
        )],
        ephemeral: true
      });
    } catch (error) {
      console.error(`Error creating channel ${name}:`, error);
      failedChannels.push({ name, error: error.message });
    }
  }

  // Create a final embed with the results
  const embed = new EmbedBuilder()
    .setTitle('Bulk Channel Creation Results')
    .setColor(createdChannels.length > 0 ? '#00FF00' : '#FF0000')
    .setDescription(
      `**Successfully created ${createdChannels.length}/${channelNames.length} channels**\n\n` +
      (createdChannels.length > 0 ? `**Created Channels:**\n${createdChannels.map(channel => `• ${channel.name} (${channel.id})`).join('\n')}\n\n` : '') +
      (failedChannels.length > 0 ? `**Failed Channels:**\n${failedChannels.map(channel => `• ${channel.name}: ${channel.error}`).join('\n')}` : '')
    )
    .setTimestamp();

  // Send the final results
  await interaction.editReply({
    embeds: [embed],
    ephemeral: true
  });
}