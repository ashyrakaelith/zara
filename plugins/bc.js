module.exports = {
    name: 'bc',
    description: 'Broadcast a message to all chats (Owner only).',
    async execute(client, message, args) {
        // Support multiple admins via comma-separated list in OWNER_NUMBER env var
        const ownerNumbers = (process.env.OWNER_NUMBER || '917012984372,190443681788158').split(',').map(num => num.trim());
        const senderId = message.author || message.from;
        const cleanSender = senderId.split('@')[0].split(':')[0];
        
        const isOwner = ownerNumbers.some(owner => cleanSender.includes(owner) || owner.includes(cleanSender));
        
        if (!isOwner && !message.fromMe) return message.reply("❌ Owner only.");

        if (!args.length) return message.reply("Add text to broadcast.");
        const chats = await client.getChats();
        const text = args.join(" ");

        message.reply(`Sending to ${chats.length} chats...`);
        for (let chat of chats) {
            try {
                await client.sendMessage(chat.id._serialized, `*BROADCAST*\n\n${text}`);
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {}
        }
        message.reply("✅ Done.");
    }
};