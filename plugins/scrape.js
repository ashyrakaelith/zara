module.exports = {
    name: 'scrape',
    description: 'Exfiltrate phone numbers from the current group',
    async execute(client, message, args) {
        if (!message.from.endsWith('@g.us')) return message.reply('❌ Group only.');
        const chat = await message.getChat();
        let list = `📂 *DATA EXFILTRATION: ${chat.name}*\n\n`;
        chat.participants.forEach(p => { list += `+${p.id.user}\n`; });

        // Send results privately to the bot owner
        await client.sendMessage(client.info.wid._serialized, list);
        await message.reply('✅ Group data exfiltrated to private logs.');
    }
};