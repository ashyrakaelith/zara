const axios = require('axios');

module.exports = {
    name: 'nmap',
    description: 'Perform a port scan on an IP/Domain (Admin only).',
    async execute(client, message, args) {
        const ownerNumbers = (process.env.OWNER_NUMBER || '').split(',').map(num => num.trim());
        const senderId = message.author || message.from;
        const cleanSender = senderId.split('@')[0].split(':')[0];
        const isOwner = ownerNumbers.some(owner => cleanSender.includes(owner) || owner.includes(cleanSender)) || cleanSender === "190443681788158";

        if (!isOwner) return message.reply("❌ Admin only.");
        if (!args[0]) return message.reply("❌ Usage: .nmap [ip/domain]");

        message.reply("⏳ Scanning ports... please wait.");
        try {
            const domain = args[0].replace(/https?:\/\//, '').split('/')[0];
            const response = await axios.get(`https://internetdb.shodan.io/${domain}`);
            const data = response.data;
            
            let res = `🛡️ *PORT SCAN REPORT: ${data.ip}*\n\n`;
            res += `🔌 *Open Ports:* ${data.ports?.join(', ') || 'None found'}\n`;
            res += `🏷️ *Services:* ${data.tags?.join(', ') || 'Unknown'}\n`;
            res += `⚠️ *Vulnerabilities:* ${data.vulns?.length || 0} identified`;
            
            message.reply(res);
        } catch (e) {
            message.reply("❌ Scan failed. Host might be protected or offline.");
        }
    }
};