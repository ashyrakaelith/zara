module.exports = {
    name: 'ping',
    description: 'Check the bot response speed.',
    async execute(client, message) {
        const start = Date.now();
        await message.reply('⏱️ Pinging...');
        const end = Date.now();
        await client.sendMessage(message.from, `⏱️ Response speed: ${end - start}ms`);
    }
};
