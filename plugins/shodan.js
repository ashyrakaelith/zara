const axios = require('axios');

module.exports = {
    name: 'shodan',
    description: 'Scan an IP address using Shodan (Public data).',
    async execute(client, message, args) {
        if (!args[0]) return message.reply("❌ Usage: .shodan [IP]");
        
        try {
            const ip = args[0];
            // Using a public internet DB API for demo-level forensics
            const response = await axios.get(`https://internetdb.shodan.io/${ip}`);
            const data = response.data;
            
            let res = `🛰️ *SHODAN FORENSIC SCAN*\n\n`;
            res += `🌐 *IP:* ${data.ip}\n`;
            res += `🏢 *Hostnames:* ${data.hostnames?.join(', ') || 'None'}\n`;
            res += `🔌 *Open Ports:* ${data.ports?.join(', ') || 'None'}\n`;
            res += `🛡️ *CPES:* ${data.cpes?.length || 0} identified\n`;
            res += `⚠️ *Vulnerabilities:* ${data.vulns?.length || 0} found\n`;
            
            if (data.tags && data.tags.length > 0) {
                res += `🏷️ *Tags:* ${data.tags.join(', ')}\n`;
            }

            message.reply(res);
        } catch (e) {
            message.reply("❌ IP not found in Shodan database or API error.");
        }
    }
};