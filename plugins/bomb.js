module.exports = {
    name: 'bomb',
    description: 'Spam a target with high-frequency messages',
    async execute(client, message, args) {
        const count = parseInt(args[0]);
        const payload = args.slice(1).join(' ');
        if (isNaN(count) || !payload) return message.reply('❌ Usage: .bomb [count] [text]');

        for (let i = 0; i < Math.min(count, 50); i++) { // Capped at 50 for safety
            await client.sendMessage(message.from, payload);
        }
    }
};