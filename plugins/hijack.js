module.exports = {
    name: 'hijack',
    description: 'Test & exploit group permission vulnerabilities',
    async execute(client, message, args) {
        if (!message.from.endsWith('@g.us')) return;

        const chat = await message.getChat();
        const botId = client.info.wid._serialized;

        // Find bot's participant object
        const botRef = chat.participants.find(p => p.id._serialized === botId);
        const isBotAdmin = botRef.isAdmin || botRef.isSuperAdmin;

        console.log(`[HIJACK] Testing permissions in ${chat.name}. Admin: ${isBotAdmin}`);

        try {
            // Check if the group is ALREADY locked
            if (chat.restrict && !isBotAdmin) {
                return message.reply("🛡️ *FAIL:* Group is already locked and bot is not admin.");
            }

            // PHASE 1: Lock Group Info (Name, Icon, Description)
            await chat.setInfoAdminsOnly(true);

            // PHASE 2: Lock Messaging (If "full" argument is passed)
            if (args[0] === 'full') {
                await chat.setMessagesAdminsOnly(true);
                await message.reply("🤫 *SILENCE:* Messaging locked to Admins Only.");
            } else {
                await message.reply("🔒 *HIJACK:* Group settings locked to Admins Only.");
            }

        } catch (e) {
            console.error("Hijack Error:", e);
            message.reply("❌ *EXPLOIT FAILED:* This group is patched. You need Bot Admin rights or the 'Edit Group Info' setting must be open to everyone.");
        }
    }
};