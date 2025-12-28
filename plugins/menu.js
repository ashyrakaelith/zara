module.exports = {
    name: 'menu',
    async execute(client, message, args, plugins) {
        const contact = await message.getContact();
        const prefix = '.';
        
        const categories = {
            "General": ['hi', 'ping', 'info', 'menu'],
            "Admin": ['all', 'hidetag', 'kick', 'promote', 'link', 'group'],
            "Bot Owner": ['bc', 'restart', 'eval'],
            "Tools": ['s', 'del']
        };

        let menuText = `✨ *BOT DASHBOARD* ✨\n`;
        menuText += `👤 User: ${contact.pushname || 'User'}\n`;
        menuText += `━━━━━━━━━━━━━━━━━━\n\n`;

        for (const [category, cmds] of Object.entries(categories)) {
            menuText += `*〔 ${category.toUpperCase()} 〕*\n`;
            cmds.forEach(cmd => {
                if (plugins[cmd]) menuText += `> ${prefix}${cmd}\n`;
            });
            menuText += `\n`;
        }

        menuText += `━━━━━━━━━━━━━━━━━━\n`;
        menuText += `_Type ${prefix}s for stickers_`;
        
        await message.reply(menuText);
    }
};