module.exports = {
    name: 'quote',
    description: 'Get an inspirational quote.',
    async execute(client, message) {
        try {
            const response = await fetch('https://api.quotable.io/random');
            const data = await response.json();
            if (data.content) {
                await message.reply(`" ${data.content} "\n\n— *${data.author}*`);
            } else {
                message.reply('⚠️ Could not fetch a quote right now.');
            }
        } catch (e) {
            message.reply('⚠️ Error fetching quote.');
        }
    }
};
