module.exports = {
    name: 'info',
    async execute(client, message) {
        const chat = await message.getChat();
        const contactId = message.author || message.from;
        const number = contactId.split('@')[0].split(':')[0];
        
        let res = `*USER INFO*\n`;
        res += `Number: ${number}\n`;
        res += `In Group: ${chat.isGroup ? 'Yes' : 'No'}`;
        await message.reply(res);
    }
};