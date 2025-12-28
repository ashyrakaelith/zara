module.exports = {
    name: 'all',
    description: 'Tag all members in the group.',
    async execute(client, message, args) {
        const chat = await message.getChat();
        if (!chat.isGroup) return message.reply("Groups only.");

        let mentions = [];
        let text = `📢 *Attention!*\n\n${args.join(' ') || 'No message'}\n\n`;

        for (let participant of chat.participants) {
            mentions.push(participant.id._serialized);
            text += `@${participant.id.user} `;
        }
        await chat.sendMessage(text, { mentions });
    }
};