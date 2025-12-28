# Zara - WhatsApp Bot

## Overview
A WhatsApp bot built with Node.js using `whatsapp-web.js` library. The bot runs headless Chromium to interface with WhatsApp Web and supports plugin-based commands.

## Project Structure
```
/
├── index.js          # Main bot entry point
├── plugins/          # Command plugins
│   ├── all.js        # Mention all group members
│   ├── bc.js         # Broadcast message (owner only)
│   ├── menu.js       # Display available commands
│   └── sticker.js    # Convert media to sticker
├── package.json      # Node.js dependencies
└── .gitignore        # Git ignore rules
```

## Dependencies
- `whatsapp-web.js` - WhatsApp Web client
- `qrcode-terminal` - QR code display in console
- `dotenv` - Environment variable management

## System Dependencies
- `chromium` - Headless browser for WhatsApp Web

## Running the Bot
1. Start the workflow "WhatsApp Bot"
2. Scan the QR code displayed in the console with your WhatsApp mobile app
3. Bot will be online and respond to commands prefixed with `.`

## Available Commands
- `.menu` - Show all available commands
- `.all [message]` - Mention all group members (groups only)
- `.bc [message]` - Broadcast message to all chats (owner only)
- `.s` - Convert image/video to sticker

## Environment Variables
- `OWNER_NUMBER` - Your WhatsApp number (without + or country code spaces) for owner-only commands

## Architecture
The bot uses a plugin system where each command is a separate module in the `plugins/` folder. Plugins are auto-loaded on startup and must export:
- `name` - Command name (string)
- `execute(client, message, args, plugins)` - Async function to handle the command
