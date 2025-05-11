# Discord Guild Management Bot

A powerful Discord bot built with Discord.js v14 that provides comprehensive role and channel management through an interactive interface with buttons and select menus.

## Features

### Role Management
- **Create Roles**: Create new roles with custom names, colors, and positions through a modal form
- **Delete Roles**: Safely remove roles with confirmation through select menus
- **Move Roles**: Adjust role positions in the hierarchy with up/down controls

### Channel Management
- **Create Channels**: Create new text, voice, or category channels with custom settings
- **Delete Channels**: Remove channels with confirmation to prevent accidental deletion
- **Move Channels**: Adjust channel positions in the server with intuitive controls

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
2. Create new component handlers in `src/components/`:
   - `buttons/` - Button interaction handlers
   - `selectMenus/` - Select menu interaction handlers
   - `modals/` - Modal form submission handlers
3. Deploy the commands with `npm run deploy`
4. Start the bot with `npm start` or `npm run dev` for development

## Project Structure

```
src/
├── commands/           # Slash commands
│   └── panel.js        # Main panel command
├── components/         # UI components
│   ├── buttons/        # Button handlers
│   ├── modals/         # Modal form handlers
│   └── selectMenus/    # Select menu handlers
├── utils/              # Utility functions
│   ├── embeds.js       # Embed creators
│   └── permissions.js  # Permission checks
├── config.js           # Bot configuration
├── deploy-commands.js  # Command deployment script
└── index.js            # Main bot file
```

## License

MIT