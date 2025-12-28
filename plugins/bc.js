module.exports = {
    name: 'bc',
    description: 'Broadcast a message to all chats (Owner only).',
    async execute(client, message, args) {
        const owner = process.env.OWNER_NUMBER + '@c.us';
        if (message.from !== owner && !message.fromMe) return message.reply("Owner only.");

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