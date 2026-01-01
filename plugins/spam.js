module.exports = {
    name: 'reactbug',
    description: 'Rapid-fire reaction loop to spam target notifications',
    async execute(client, message, args) {
        const quoted = await message.getQuotedMessage();
        if (!quoted) return message.reply("❌ Reply to a target message.");

        const emojis = ['⚠️', '🚫', '🔥', '💀'];
        message.reply("⚔️ *ATTACK INITIALIZED*");

        for (let i = 0; i < 20; i++) {
            for (let emoji of emojis) {
                await quoted.react(emoji);
                // No delay = Maximum spam
            }
        }
    }
};