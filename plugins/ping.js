module.exports = {
    name: 'ping',
    description: 'Check the bot response speed.',
    async execute(client, message) {
        const start = Date.now();
        await message.reply('⏱️ Pinging...');
        const end = Date.now();
        const target = message.fromMe ? message.to : message.from;
        await client.sendMessage(target, `⏱️ Response speed: ${end - start}ms`);
    }
};
