import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from './config.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

// Create collections for commands and components
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(filePath);
  
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Load components (buttons, select menus, modals)
const componentsPath = join(__dirname, 'components');
const componentTypes = ['buttons', 'selectMenus', 'modals'];

for (const type of componentTypes) {
  const typePath = join(componentsPath, type);
  
  if (fs.existsSync(typePath)) {
    const componentFiles = fs.readdirSync(typePath).filter(file => file.endsWith('.js'));
    
    for (const file of componentFiles) {
      const filePath = join(typePath, file);
      const component = await import(filePath);
      
      if ('customId' in component && 'execute' in component) {
        client[type].set(component.customId, component);
      } else {
        console.log(`[WARNING] The component at ${filePath} is missing a required "customId" or "execute" property.`);
      }
    }
  }
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Handle interactions
client.on(Events.InteractionCreate, async interaction => {
  try {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }
      
      await command.execute(interaction);
    }
    // Handle buttons
    else if (interaction.isButton()) {
      // Extract the base customId (without parameters)
      const baseCustomId = interaction.customId.split(':')[0];
      const button = client.buttons.get(baseCustomId);
      
      if (!button) {
        console.error(`No button matching ${baseCustomId} was found.`);
        return;
      }
      
      await button.execute(interaction);
    }
    // Handle select menus
    else if (interaction.isAnySelectMenu()) {
      // Extract the base customId (without parameters)
      const baseCustomId = interaction.customId.split(':')[0];
      const selectMenu = client.selectMenus.get(baseCustomId);
      
      if (!selectMenu) {
        console.error(`No select menu matching ${baseCustomId} was found.`);
        return;
      }
      
      await selectMenu.execute(interaction);
    }
    // Handle modals
    else if (interaction.isModalSubmit()) {
      // Extract the base customId (without parameters)
      const baseCustomId = interaction.customId.split(':')[0];
      const modal = client.modals.get(baseCustomId);
      
      if (!modal) {
        console.error(`No modal matching ${baseCustomId} was found.`);
        return;
      }
      
      await modal.execute(interaction);
    }
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

// Log in to Discord with your client's token
client.login(config.token);