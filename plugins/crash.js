module.exports = {
    name: 'crash',
    description: 'Send a formatted message to test app resilience (Bug test).',
    async execute(client, message, args) {
        const target = message.fromMe ? message.to : message.from;
        const char = '‎';
        const bug = char.repeat(50000);
        await client.sendMessage(target, `🛡️ *Resilience Test*\n\nPayload: [${bug.length} characters]`);
    }
};