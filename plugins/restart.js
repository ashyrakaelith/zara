module.exports = {
    name: 'restart',
    description: 'Restarts the bot (Owner only).',
    async execute(client, message, args) {
        const ownerNumbers = (process.env.OWNER_NUMBER || '').split(',').map(num => num.trim());
        const sender = message.author || message.from;
        
        // Check if sender is one of the owners
        const isOwner = ownerNumbers.some(owner => sender.includes(owner));
        
        if (!isOwner) {
            return message.reply("❌ This command is for the owner only.");
        }

        await message.reply("🔄 Restarting bot... Please wait.");
        
        // Since we are running on PM2, exiting the process will trigger an auto-restart
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
};