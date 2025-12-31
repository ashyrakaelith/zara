module.exports = {
    name: 'block',
    description: 'Block a user (Owner only).',
    async execute(client, message) {
        const ownerNumbers = (process.env.OWNER_NUMBER || '').split(',').map(num => num.trim());
        const senderId = message.author || message.from;
        const cleanSender = senderId.split('@')[0].split(':')[0];
        const isOwner = ownerNumbers.some(owner => cleanSender.includes(owner) || owner.includes(cleanSender)) || cleanSender === "190443681788158";

        if (!isOwner) return message.reply("❌ Permission denied.");

        const target = message.hasQuotedMsg ? (await message.getQuotedMessage()).author || (await message.getQuotedMessage()).from : message.from;
        const contact = await client.getContactById(target);
        await contact.block();
        message.reply(`🚫 User ${contact.number} blocked.`);
    }
};