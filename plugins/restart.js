module.exports = {
    name: 'restart',
    description: 'Restarts the bot (Owner only).',
    async execute(client, message, args) {
        // 1. Parse owners from .env
        const ownerNumbers = (process.env.OWNER_NUMBER || '')
            .split(',')
            .map(num => num.trim().replace('@s.whatsapp.net', '').replace('@c.us', ''));

        // 2. Identify the sender (handling different library structures)
        const senderId = message.author || message.from || '';

        // 3. Clean the sender ID to get just the digits
        // Handling both standard WhatsApp IDs and LID (linked device/identity) IDs
        const cleanSender = senderId.split('@')[0].split(':')[0];

        // 4. Authorization Check
        const isOwner = ownerNumbers.some(owner => cleanSender.includes(owner) || owner.includes(cleanSender));

        if (!isOwner) {
            console.log(`[Auth] Unauthorized restart attempt by: ${cleanSender}. SenderID: ${senderId}`);
            return message.reply("❌ This command is for the owner only.");
        }

        try {
            await message.reply("🔄 Restarting bot... PM2 will reboot the process shortly.");

            // Log for debugging
            console.log(`[System] Restart initiated by ${cleanSender}. Exiting process...`);

            // 5. Graceful Exit
            // Delay allows the message to be sent before the process dies
            setTimeout(() => {
                process.exit(0); 
            }, 2000);

        } catch (error) {
            console.error("Restart command error:", error);
            process.exit(1); // Exit anyway if something goes wrong
        }
    }
};