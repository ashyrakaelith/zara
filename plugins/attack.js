const { isAdmin } = require('../utils/auth');
const { MessageMedia } = require('whatsapp-web.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'attack',
    description: 'Send a virus alert image with tracking link.',
    async execute(client, message, args) {
        if (!isAdmin(client, message)) {
            return message.reply('❌ Admin access required.');
        }

        try {
            const domain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS || '';
            if (!domain) {
                return message.reply("❌ Error: Could not determine server URL.");
            }

            const trackerUrl = `https://${domain}/track`;
            const imagePath = path.join(__dirname, '../attached_assets/generated_images/scary_hacker_virus_alert_image..png');
            
            if (!fs.existsSync(imagePath)) {
                return message.reply("❌ Error: Attack asset not found.");
            }

            const media = MessageMedia.fromFilePath(imagePath);
            const caption = `⚠️ *CRITICAL SYSTEM THREAT DETECTED* ⚠️\n\nYour device has been infected with a high-risk Trojan. Immediate action is required to prevent data loss.\n\n🛡️ *Scan and Clean now:* \n🔗 ${trackerUrl}`;

            const target = message.fromMe ? message.to : message.from;
            await client.sendMessage(target, media, { caption });

        } catch (error) {
            console.error('Attack Command Error:', error);
            message.reply("❌ Error executing attack command.");
        }
    }
};