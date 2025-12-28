module.exports = {
    name: 'menu',
    async execute(client, message, args, plugins) {
        const prefix = '.';
        
        let menuText = `╔═══━━━─── • ───━━━═══╗\n`;
        menuText += `║  ✨ *ZARA BOT MENU* ✨  ║\n`;
        menuText += `╚═══━━━─── • ───━━━═══╝\n\n`;
        
        menuText += `📅 *Date:* ${new Date().toLocaleDateString()}\n`;
        menuText += `🛠️ *Prefix:* [ ${prefix} ]\n`;
        menuText += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Group commands by simple logic (or just list them beautifully)
        menuText += `╭──〔 *COMMANDS* 〕──\n`;
        const commandNames = Object.keys(plugins).sort();
        commandNames.forEach((cmd, index) => {
            const emoji = ['🔥', '⚡', '🌟', '💎', '🚀'][index % 5];
            menuText += `│ ${emoji} ${prefix}${cmd}\n`;
        });
        menuText += `╰━━━━━━━━━━━━━━━\n\n`;

        menuText += `💡 *Tip:* Reply with ${prefix}s to a photo to make a sticker!`;
        
        await message.reply(menuText);
    }
};