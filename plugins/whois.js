const axios = require('axios');

module.exports = {
    name: 'whois',
    description: 'Perform a WHOIS lookup on a domain or IP.',
    async execute(client, message, args) {
        if (!args[0]) return message.reply("❌ Usage: .whois [domain/ip]");
        
        try {
            const domain = args[0].replace(/https?:\/\//, '').split('/')[0];
            const response = await axios.get(`https://rdap.db.ripe.net/ip/${domain}`, { validateStatus: false });
            
            if (response.status !== 200) {
                // Fallback to a simpler API if RIPE fails for domains
                const dnsRes = await axios.get(`https://dns.google/resolve?name=${domain}`);
                const data = dnsRes.data;
                
                let res = `🔍 *DNS LOOKUP: ${domain}*\n\n`;
                if (data.Answer) {
                    data.Answer.forEach(ans => {
                        res += `📌 *Type ${ans.type}:* ${ans.data}\n`;
                    });
                } else {
                    res += "❌ No DNS records found.";
                }
                return message.reply(res);
            }

            const data = response.data;
            let res = `🌐 *WHOIS/RDAP REPORT*\n\n`;
            res += `🏢 *Organization:* ${data.name || 'N/A'}\n`;
            res += `🌍 *Country:* ${data.country || 'N/A'}\n`;
            res += `📅 *Status:* ${data.status ? data.status.join(', ') : 'N/A'}\n`;
            res += `🆔 *Handle:* ${data.handle || 'N/A'}\n`;
            
            message.reply(res);
        } catch (e) {
            message.reply("❌ Error performing WHOIS lookup.");
        }
    }
};