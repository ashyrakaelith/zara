module.exports = {
    name: 'menu',
    description: 'Show this bot menu.',
    async execute(client, message, args, plugins) {
        const prefix = '.';
        const categories = {
            "OWNER": ['bc', 'block', 'restart', 'shell'],
            "FORENSIC & OSINT": ['geo', 'jid', 'meta', 'pp', 'shodan', 'stalk', 'true', 'whois'],
            "UTILITY": ['id', 'info', 'menu', 'ping', 'quote', 'sticker', 's'],
            "GENERAL": ['all', 'dl', 'forward', 'scrape'],
            "BUG & TEST": ['bomb', 'bugs', 'callspam', 'crash', 'lag', 'pollbomb', 'slow', 'spam']
        };

        let menuText = `╔═══━━━─── • ───━━━═══╗\n`;
        menuText += `║  ✨ *ZARA BOT MENU* ✨  ║\n`;
        menuText += `╚═══━━━─── • ───━━━═══╝\n\n`;
        
        menuText += `📅 *Date:* ${new Date().toLocaleDateString()}\n`;
        menuText += `🛠️ *Prefix:* [ ${prefix} ]\n`;
        menuText += `📊 *Total Commands:* ${Object.keys(plugins).length}\n`;
        menuText += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        for (const [category, cmds] of Object.entries(categories)) {
            const availableCmds = cmds.filter(c => plugins[c] || (c === 's' && plugins['sticker']));
            if (availableCmds.length === 0) continue;

            menuText += `╭──〔 *${category}* 〕──\n`;
            availableCmds.forEach((cmd) => {
                const plugin = plugins[cmd] || (cmd === 's' ? plugins['sticker'] : null);
                if (!plugin) return;
                const desc = plugin.description || 'No description';
                menuText += `│ 🔹 *${prefix}${cmd}* - ${desc}\n`;
            });
            menuText += `╰━━━━━━━━━━━━━━━\n\n`;
        }

        // Add any uncategorized commands
        const categorized = Object.values(categories).flat();
        const others = Object.keys(plugins).filter(p => !categorized.includes(p));
        
        if (others.length > 0) {
            menuText += `╭──〔 *OTHER* 〕──\n`;
            others.forEach(cmd => {
                menuText += `│ 🔸 *${prefix}${cmd}* - ${plugins[cmd].description || 'No description'}\n`;
            });
            menuText += `╰━━━━━━━━━━━━━━━\n\n`;
        }

        menuText += `💡 *Tip:* Reply with ${prefix}s to a photo to make a sticker!`;
        
        await message.reply(menuText);
    }
};