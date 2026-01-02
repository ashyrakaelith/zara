let reactionIntervals = {};

module.exports = {
    name: 'reactbug',
    description: 'Spam reactions to a message every second.',
    async execute(client, message, args) {
        const ownerNumber = process.env.OWNER_NUMBER || '917012984372';
        const sender = message.fromMe ? client.info.wid.user : message.author || message.from;
        const isAdmin = sender.includes(ownerNumber) || sender.includes('190443681788158');

        if (!isAdmin) {
            return message.reply('❌ Admin access required.');
        }

        if (!message.hasQuotedMsg && args[0] !== 'off') {
            return message.reply('❌ Please reply to a message to start the reaction bug.');
        }

        const chatId = message.from;

        if (args[0] === 'off') {
            if (reactionIntervals[chatId]) {
                clearInterval(reactionIntervals[chatId]);
                delete reactionIntervals[chatId];
                return message.reply('🛑 Reaction bug stopped for this chat.');
            }
            return message.reply('❌ No active reaction bug in this chat.');
        }

        if (reactionIntervals[chatId]) {
            return message.reply('⚠️ A reaction bug is already running in this chat. Use `.reactbug off` to stop it.');
        }

        const quotedMsg = await message.getQuotedMessage();
        const reactions = ['🔥', '⚡', '💣', '👾', '🌀', '💀', '🤡', '⚠️'];
        let count = 0;

        message.reply('🚀 *Reaction Bug Started!* Sending reactions every 1 second...');

        reactionIntervals[chatId] = setInterval(async () => {
            try {
                const emoji = reactions[count % reactions.length];
                await quotedMsg.react(emoji);
                count++;
            } catch (err) {
                console.error('Reaction Bug Error:', err);
                clearInterval(reactionIntervals[chatId]);
                delete reactionIntervals[chatId];
            }
        }, 1000);
    }
};