module.exports = {
    name: 'info',
    async execute(client, message) {
        const chat = await message.getChat();
        const contact = await message.getContact();
        let res = `*USER INFO*\n`;
        res += `Number: ${contact.number}\n`;
        res += `Pushname: ${contact.pushname}\n`;
        res += `In Group: ${chat.isGroup ? 'Yes' : 'No'}`;
        await message.reply(res);
    }
};