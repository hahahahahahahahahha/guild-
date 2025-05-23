# Discord Guild Management Bot

A powerful Discord bot built with Discord.js v14 that provides comprehensive role and channel management through an interactive interface with buttons and select menus. The bot features a Russian language interface for improved user experience. If you find a bug or something is not working, write to me in a discord private message: 
```
welcomethenewking | 1354758424491196487
```

## Features

### Role Management
- **Create Roles**: Create new roles with custom names, colors, and positions through a modal form
- **Delete Roles**: Safely remove roles with confirmation through select menus
- **Move Roles**: Adjust role positions in the hierarchy with up/down controls
- **Role Permissions**: Manage detailed permissions for each role with category-based UI
- **Bulk Role Operations**: Create, delete, or color multiple roles at once
- **Direct Role Management**: Select any role from a list to directly edit its properties
- **Role Properties**: Edit role name, color, hoisted status, and mentionable status

### Channel Management
- **Create Channels**: Create new text, voice, or category channels with custom settings
- **Delete Channels**: Remove channels with confirmation to prevent accidental deletion
- **Move Channels**: Adjust channel positions in the server with intuitive controls
- **Channel Permissions**: Manage permissions for roles and members in each channel
- **Bulk Channel Operations**: Create or delete multiple channels at once
- **Direct Channel Management**: Select any channel from a list to directly edit its properties
- **Channel Properties**: Edit channel name, topic, category, slowmode, and user limits

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
2. Select from the available management options:
   - **Role Management**: Create, delete, and move roles
   - **Channel Management**: Create, delete, and move channels
   - **Role Permissions**: Manage detailed permissions for roles
   - **Channel Permissions**: Manage permissions for channels
   - **Bulk Operations**: Perform operations on multiple roles or channels at once
   - **View Roles**: View and directly manage all server roles
   - **View Channels**: View and directly manage all server channels
3. Choose an action from the available buttons
4. Follow the prompts to complete the action

### Advanced Features

#### Direct Role Management
- View a list of all roles on the server
- Select any role to directly manage its properties:
  - Edit role name with a modal form
  - Change role color with a color picker
  - Toggle role visibility in the member list (hoisted status)
  - Toggle role mentionability
  - Move role up or down in the hierarchy
  - Manage role permissions
  - Delete role with confirmation

#### Direct Channel Management
- View a list of all channels on the server
- Select any channel to directly manage its properties:
  - Edit channel name with a modal form
  - Edit channel topic/description
  - Change channel category
  - Move channel up or down in the list
  - Configure channel-specific settings (slowmode, user limits)
  - Manage channel permissions
  - Delete channel with confirmation

#### Role Permissions Management
- Select a role to manage its permissions
- Toggle individual permissions or entire categories
- Reset permissions to default
- Toggle administrator permission with one click

#### Channel Permissions Management
- Select a channel to manage its permissions
- Set permissions for roles or specific members
- Sync permissions with category
- View all permissions in a channel

#### Bulk Operations
- Create multiple roles or channels at once
- Delete multiple roles or channels with one action
- Apply colors to multiple roles simultaneously

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
│   │   ├── createRole.js
│   │   ├── deleteRole.js
│   │   ├── moveRole.js
│   │   ├── moveRoleUp.js
│   │   ├── moveRoleDown.js
│   │   ├── rolePermissions.js
│   │   ├── toggleRolePermission.js
│   │   ├── toggleAdminPermission.js
│   │   ├── resetRolePermissions.js
│   │   ├── confirmResetRolePermissions.js
│   │   ├── manageRole.js
│   │   ├── editRoleName.js
│   │   ├── editRoleColor.js
│   │   ├── toggleRoleHoisted.js
│   │   ├── toggleRoleMentionable.js
│   │   ├── deleteSpecificRole.js
│   │   ├── confirmDeleteSpecificRole.js
│   │   ├── createChannel.js
│   │   ├── deleteChannel.js
│   │   ├── moveChannel.js
│   │   ├── moveChannelUp.js
│   │   ├── moveChannelDown.js
│   │   ├── channelPermissions.js
│   │   ├── manageChannel.js
│   │   ├── editChannelName.js
│   │   ├── deleteSpecificChannel.js
│   │   ├── confirmDeleteSpecificChannel.js
│   │   ├── bulkRoleOperations.js
│   │   ├── bulkChannelOperations.js
│   │   ├── viewRoles.js
│   │   ├── viewChannels.js
│   │   ├── backToPanel.js
│   │   └── ...
│   ├── modals/         # Modal form handlers
│   │   ├── createRoleModal.js
│   │   ├── createChannelModal.js
│   │   ├── bulkCreateRolesModal.js
│   │   ├── bulkCreateChannelsModal.js
│   │   ├── editRoleNameModal.js
│   │   ├── editRoleColorModal.js
│   │   ├── editChannelNameModal.js
│   │   └── ...
│   └── selectMenus/    # Select menu handlers
│       ├── panelSelect.js
│       ├── deleteRoleSelect.js
│       ├── deleteChannelSelect.js
│       ├── rolePermissionsSelect.js
│       ├── rolePermissionsCategorySelect.js
│       ├── channelPermissionsSelect.js
│       ├── manageRoleSelect.js
│       ├── manageChannelSelect.js
│       └── ...
├── utils/              # Utility functions
│   ├── embeds.js       # Embed creators
│   └── permissions.js  # Permission checks
├── config.js           # Bot configuration
├── deploy-commands.js  # Command deployment script
└── index.js            # Main bot file
```

## License
by gls63
