# Discord Guild Management Bot

A Discord bot for managing roles and channels through an interactive interface with buttons and select menus.

## Features

### Role Management
- Create new roles with custom name, color, and position
- Delete existing roles
- Move roles up and down in the hierarchy

### Channel Management
- Create new channels with custom name, type, and category
- Delete existing channels
- Move channels up and down in the list

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure the bot in `src/config.js`:
   ```js
   export const config = {
     token: "YOUR_BOT_TOKEN",
     guildId: "YOUR_GUILD_ID",
     developerId: "YOUR_DISCORD_USER_ID"
   };
   ```
4. Deploy slash commands:
   ```
   npm run deploy
   ```
5. Start the bot:
   ```
   npm start
   ```

## Usage

1. Use the `/panel` command to open the management panel
2. Select either "Role Management" or "Channel Management"
3. Choose an action from the available buttons
4. Follow the prompts to complete the action

## Requirements

- Node.js v16.9.0 or higher
- Discord.js v14
- A Discord bot token with proper permissions:
  - `MANAGE_ROLES`
  - `MANAGE_CHANNELS`
  - `ADMINISTRATOR` (recommended)

## Security

- All actions require administrator permissions
- Confirmation is required for destructive actions
- All interactions are ephemeral (only visible to the user who triggered them)

## Development

This bot uses ESM modules. To add new features:

1. Create new command files in `src/commands/`
2. Create new component handlers in `src/components/`
3. Deploy the commands with `npm run deploy`
4. Start the bot with `npm start` or `npm run dev` for development

## License

MIT