module.exports = {
    name: 'owner',
    description: 'Get bot owner information.',
    async execute(client, message) {
        const ownerNumber = process.env.OWNER_NUMBER || 'Not set';
        await message.reply(`👤 *Bot Owner Info*\n\n📞 Number: ${ownerNumber}\n✨ Name: Zara Bot Admin`);
    }
};
