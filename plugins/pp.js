const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'pp',
    description: 'Get profile picture of a user.',
    async execute(client, message, args) {
        try {
            const target = message.hasQuotedMsg 
                ? (await message.getQuotedMessage()).author || (await message.getQuotedMessage()).from 
                : (args[0] ? args[0].replace(/\D/g, '') + '@c.us' : message.from);
            
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