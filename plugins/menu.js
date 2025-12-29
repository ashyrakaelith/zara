module.exports = {
    name: 'menu',
    description: 'Show this bot menu.',
    async execute(client, message, args, plugins) {
        const prefix = '.';
        
        let menuText = `╔═══━━━─── • ───━━━═══╗\n`;
        menuText += `║  ✨ *ZARA BOT MENU* ✨  ║\n`;
        menuText += `╚═══━━━─── • ───━━━═══╝\n\n`;
        
        menuText += `📅 *Date:* ${new Date().toLocaleDateString()}\n`;
        menuText += `🛠️ *Prefix:* [ ${prefix} ]\n`;
        menuText += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        menuText += `╭──〔 *COMMANDS* 〕──\n`;
        const commandNames = Object.keys(plugins).sort();
        commandNames.forEach((cmd, index) => {
            const emojis = ['🔥', '⚡', '🌟', '💎', '🚀', '🛠️', '🕵️', '🚫', '💻', '👁️'];
            const emoji = emojis[index % emojis.length];
            const desc = plugins[cmd].description || 'No description';
            menuText += `│ ${emoji} *${prefix}${cmd}* - ${desc}\n`;
        });
        menuText += `╰━━━━━━━━━━━━━━━\n\n`;

        menuText += `💡 *Tip:* Reply with ${prefix}s to a photo to make a sticker!`;
        
        await message.reply(menuText);
    }
};