import { EmbedBuilder } from 'discord.js';

/**
 * Create a panel embed for the management interface
 * @param {string} title - The title of the embed
 * @param {string} description - The description of the embed
 * @returns {EmbedBuilder} - The embed builder
 */
export const createPanelEmbed = (title, description) => {
  return new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle(`🛠️ ${title}`)
    .setDescription(description)
    .setTimestamp()
    .setFooter({ text: 'Guild Management Panel' });
};

/**
 * Create a success embed
 * @param {string} title - The title of the embed
 * @param {string} description - The description of the embed
 * @returns {EmbedBuilder} - The embed builder
 */
export const createSuccessEmbed = (title, description) => {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
};

/**
 * Create an error embed
 * @param {string} title - The title of the embed
 * @param {string} description - The description of the embed
 * @returns {EmbedBuilder} - The embed builder
 */
export const createErrorEmbed = (title, description) => {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
};

/**
 * Create a loading embed
 * @param {string} title - The title of the embed
 * @param {string} description - The description of the embed
 * @returns {EmbedBuilder} - The embed builder
 */
export const createLoadingEmbed = (title, description) => {
  return new EmbedBuilder()
    .setColor(0xf39c12)
    .setTitle(`⏳ ${title}`)
    .setDescription(description)
    .setTimestamp();
};