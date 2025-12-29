module.exports = {
    name: 'id',
    description: 'Get unique serial ID of a message.',
    async execute(client, message) {
        const msg = message.hasQuotedMsg ? await message.getQuotedMessage() : message;
        const target = message.fromMe ? message.to : message.from;
        await client.sendMessage(target, `📎 *Message ID:* ${msg.id._serialized}`);
    }
};