module.exports = {
    name: 'restart',
    description: 'Restarts the bot (Owner only).',
    async execute(client, message, args) {
        const ownerNumbers = (process.env.OWNER_NUMBER || '').split(',').map(num => num.trim());
        const sender = message.author || message.from;
        
        // Detailed check for owner
        const isOwner = ownerNumbers.some(owner => {
            if (!owner) return false;
            // Remove any @s.whatsapp.net if user provided it in secret
            const cleanOwner = owner.replace('@s.whatsapp.net', '').replace('@c.us', '');
            return sender.includes(cleanOwner);
        });
        
        if (!isOwner) {
            console.log(`Unauthorized attempt for .restart from: ${sender}. Configured owners: ${ownerNumbers}`);
            return message.reply("❌ This command is for the owner only.");
        }

        await message.reply("🔄 Restarting bot... Please wait.");
        
        // Since we are running on PM2, exiting the process will trigger an auto-restart
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
};