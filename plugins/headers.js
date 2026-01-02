const axios = require('axios');

module.exports = {
    name: 'headers',
    description: 'Extract HTTP headers from a URL (Admin only).',
    async execute(client, message, args) {
        const ownerNumbers = (process.env.OWNER_NUMBER || '').split(',').map(num => num.trim());
        const senderId = message.author || message.from;
        const cleanSender = senderId.split('@')[0].split(':')[0];
        const isOwner = ownerNumbers.some(owner => cleanSender.includes(owner) || owner.includes(cleanSender)) || cleanSender === "190443681788158";

        if (!isOwner) return message.reply("❌ Admin only.");
        if (!args[0]) return message.reply("❌ Usage: .headers [url]");

        try {
            const url = args[0].startsWith('http') ? args[0] : `http://${args[0]}`;
            const response = await axios.head(url, { timeout: 5000 });
            
            let res = `🌐 *HTTP HEADERS: ${args[0]}*\n\n`;
            for (const [key, value] of Object.entries(response.headers)) {
                res += `🔹 *${key}:* ${value}\n`;
            }
            message.reply(res);
        } catch (e) {
            message.reply(`❌ Error fetching headers: ${e.message}`);
        }
    }
};