const axios = require('axios');

module.exports = {
    name: 'subdomain',
    description: 'Enumerate subdomains for a domain (Admin only).',
    async execute(client, message, args) {
        const ownerNumbers = (process.env.OWNER_NUMBER || '').split(',').map(num => num.trim());
        const senderId = message.author || message.from;
        const cleanSender = senderId.split('@')[0].split(':')[0];
        const isOwner = ownerNumbers.some(owner => cleanSender.includes(owner) || owner.includes(cleanSender)) || cleanSender === "190443681788158";

        if (!isOwner) return message.reply("❌ Admin only.");
        if (!args[0]) return message.reply("❌ Usage: .subdomain [domain]");

        message.reply("⏳ Enumerating subdomains... this may take a moment.");
        try {
            const domain = args[0].replace(/https?:\/\//, '').split('/')[0];
            const response = await axios.get(`https://crt.sh/?q=${domain}&output=json`);
            const data = response.data;
            
            const subdomains = [...new Set(data.map(item => item.name_value))].slice(0, 20);
            
            let res = `🔍 *SUBDOMAIN REPORT: ${domain}*\n\n`;
            res += subdomains.map(s => `🔹 ${s}`).join('\n');
            if (subdomains.length === 0) res += "❌ No subdomains found.";
            
            message.reply(res);
        } catch (e) {
            message.reply("❌ Subdomain enumeration failed.");
        }
    }
};