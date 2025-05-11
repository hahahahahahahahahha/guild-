import { ChannelType } from 'discord.js';
import { createSuccessEmbed, createErrorEmbed, createLoadingEmbed } from '../../utils/embeds.js';
import { checkAdmin } from '../../utils/permissions.js';

export const customId = 'create_channel_modal';

export async function execute(interaction) {
  // Check if the user has administrator permissions
  if (!await checkAdmin(interaction)) return;

  // Get the values from the modal
  const channelName = interaction.fields.getTextInputValue('channel_name');
  const channelTypeInput = interaction.fields.getTextInputValue('channel_type').toLowerCase();
  const categoryName = interaction.fields.getTextInputValue('channel_category') || null;

  // Defer the reply to show we're processing
  await interaction.deferReply({ ephemeral: true });

  try {
    // Map the channel type input to Discord.js channel types
    let channelType;
    switch (channelTypeInput) {
      case 'text':
        channelType = ChannelType.GuildText;
        break;
      case 'voice':
        channelType = ChannelType.GuildVoice;
        break;
      case 'category':
        channelType = ChannelType.GuildCategory;
        break;
      case 'announcement':
      case 'news':
        channelType = ChannelType.GuildAnnouncement;
        break;
      case 'forum':
        channelType = ChannelType.GuildForum;
        break;
      default:
        throw new Error(`Invalid channel type: ${channelTypeInput}. Valid types are: text, voice, category, forum, announcement`);
    }

    // Create loading embed
    const loadingEmbed = createLoadingEmbed(
      'Creating Channel',
      `Creating ${channelTypeInput} channel with name: **${channelName}**...`
    );

    // Send the loading message
    await interaction.editReply({
      embeds: [loadingEmbed]
    });

    // Find the category if specified
    let parentId = null;
    if (categoryName && channelType !== ChannelType.GuildCategory) {
      const categories = interaction.guild.channels.cache.filter(
        channel => channel.type === ChannelType.GuildCategory
      );
      
      const category = categories.find(
        category => category.name.toLowerCase() === categoryName.toLowerCase()
      );
      
      if (category) {
        parentId = category.id;
      } else {
        throw new Error(`Category "${categoryName}" not found. Please create it first or check the spelling.`);
      }
    }

    // Create the channel
    const channelOptions = {
      name: channelName,
      type: channelType,
      reason: `Created by ${interaction.user.tag}`
    };

    // Add parent if specified and not a category
    if (parentId && channelType !== ChannelType.GuildCategory) {
      channelOptions.parent = parentId;
    }

    // Create the channel
    const newChannel = await interaction.guild.channels.create(channelOptions);

    // Create success embed
    const successEmbed = createSuccessEmbed(
      'Channel Created',
      `Successfully created ${channelTypeInput} channel: **${newChannel.name}**\n` +
      (parentId ? `Category: **${categoryName}**\n` : '') +
      `Channel ID: **${newChannel.id}**`
    );

    // Update the message with the success embed
    await interaction.editReply({
      embeds: [successEmbed]
    });
  } catch (error) {
    console.error(error);
    
    // Create error embed
    const errorEmbed = createErrorEmbed(
      'Error Creating Channel',
      `Failed to create channel: **${error.message}**\n` +
      'Please check that the bot has the necessary permissions and try again.'
    );

    // Update the message with the error embed
    await interaction.editReply({
      embeds: [errorEmbed]
    });
  }
}