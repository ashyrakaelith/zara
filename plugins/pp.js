const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'pp',
    description: 'Get profile picture of a user.',
    async execute(client, message, args) {
        try {
            let target;
            if (message.hasQuotedMsg) {
                const quoted = await message.getQuotedMessage();
                target = quoted.author || quoted.from;
            } else if (message.mentionedIds && message.mentionedIds.length > 0) {
                target = message.mentionedIds[0];
            } else if (args[0] && args[0].includes('@')) {
                target = args[0].replace(/[@]/g, '') + '@c.us';
            } else if (args[0] && !isNaN(args[0])) {
                target = args[0] + '@c.us';
            } else {
                // If it's a private chat, get the person you're chatting with
                // If it's a group, target the group itself (unless someone is replied/tagged)
                target = message.from;
            }

            // Safety check: If we are the ones sending the command (.fromMe is true)
            // and there's no reply/mention, target the recipient of our message
            if (message.fromMe && !message.hasQuotedMsg && (!message.mentionedIds || message.mentionedIds.length === 0) && !args[0]) {
                target = message.to;
            }
            
            const profilePicUrl = await client.getProfilePicUrl(target);
            const targetChat = message.fromMe ? message.to : message.from;

            if (profilePicUrl) {
                const media = await MessageMedia.fromUrl(profilePicUrl);
                await client.sendMessage(targetChat, media, { caption: '🖼️ *Profile Picture*' });
            } else {
                await client.sendMessage(targetChat, '❌ No profile picture found for this user.');
            }
        } catch (error) {
            console.error('PP Command Error:', error);
            await message.reply('❌ Error fetching profile picture.');
        }
    }
};