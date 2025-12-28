module.exports = {
    name: 'menu',
    async execute(client, message, args, plugins) {
        const contact = await message.getContact();
        const prefix = '.';
        
        let menuText = `✨ *BOT DASHBOARD* ✨\n`;
        menuText += `👤 User: ${contact.pushname || 'User'}\n`;
        menuText += `━━━━━━━━━━━━━━━━━━\n\n`;

        // Dynamically list all loaded plugins
        menuText += `*〔 COMMANDS 〕*\n`;
        const commandNames = Object.keys(plugins).sort();
        commandNames.forEach(cmd => {
            menuText += `> ${prefix}${cmd}\n`;
        });
        menuText += `\n`;

        menuText += `━━━━━━━━━━━━━━━━━━\n`;
        menuText += `_Type ${prefix}s for stickers_`;
        
        await message.reply(menuText);
    }
};