module.exports = {
    name: 'restart',
    description: 'Restarts the bot (Owner only).',
    async execute(client, message, args) {
        const ownerNumber = process.env.OWNER_NUMBER;
        const sender = message.author || message.from;
        
        // Basic check if sender is owner
        if (ownerNumber && !sender.includes(ownerNumber)) {
            return message.reply("❌ This command is for the owner only.");
        }

        await message.reply("🔄 Restarting bot... Please wait.");
        
        // Since we are running on PM2, exiting the process will trigger an auto-restart
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
};