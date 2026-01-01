module.exports = {
    name: 'viral',
    description: 'Send a message with spoofed "Highly Forwarded" metadata',
    async execute(client, message, args) {
        const text = args.join(' ');
        if (!text) return;

        await client.sendMessage(message.from, text, {
            forwardingScore: 999,
            isForwarded: true
        });
    }
};