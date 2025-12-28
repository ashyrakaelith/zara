module.exports = {
    name: 'all',
    async execute(client, message, args) {
        const chat = await message.getChat();
        if (!chat.isGroup) return message.reply("Groups only.");

        let mentions = [];
        let text = `📢 *Attention!*\n\n${args.join(' ') || 'No message'}\n\n`;

        for (let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }
        await chat.sendMessage(text, { mentions });
    }
};