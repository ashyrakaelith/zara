module.exports = {
    name: 'jid',
    description: 'Get JID of current chat or mentioned user.',
    async execute(client, message) {
        const jid = message.hasQuotedMsg ? (await message.getQuotedMessage()).from : message.from;
        const target = message.fromMe ? message.to : message.from;
        await client.sendMessage(target, `🆔 *JID:* ${jid}`);
    }
};