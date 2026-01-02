module.exports = {
    name: 'sudo',
    description: 'Admin/Owner menu.',
    async execute(client, message, args) {
        // Support multiple admins via comma-separated list in OWNER_NUMBER env var
        const ownerNumbers = (process.env.OWNER_NUMBER || '917012984372,190443681788158').split(',');
        const sender = message.fromMe ? client.info.wid.user : message.author || message.from;
        
        // Authorization check: see if sender ID is in the admin list
        const isAdmin = ownerNumbers.some(num => sender.includes(num.trim()));
        
        if (!isAdmin) {
            return message.reply('❌ This command is restricted to the bot owner.');
        }

        const menu = `🛡️ *ZARA ADMIN (SUDO) MENU* 🛡️

👤 *Status:* Authorized Admin
🛠️ *Available Tools:*

📌 *.bc [text]* - Broadcast message to all chats
📌 *.sudo* - Show this menu
📌 *.reactbug [on/off]* - Start/Stop reaction spam
📌 *.whois [number/domain]* - Forensic lookup
📌 *.shodan [ip]* - Shodan scan
📌 *.nmap [target]* - Network scan
📌 *.subdomain [domain]* - Find subdomains
📌 *.headers [url]* - HTTP Header analysis

⚠️ *Use these tools responsibly.*`;

        const target = message.fromMe ? message.to : message.from;
        await client.sendMessage(target, menu);
    }
};