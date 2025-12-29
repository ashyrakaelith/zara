module.exports = {
    name: 'stalk',
    description: 'Get profile info of a user.',
    async execute(client, message, args) {
        try {
            const target = message.hasQuotedMsg ? (await message.getQuotedMessage()).author || (await message.getQuotedMessage()).from : (args[0] ? args[0].replace(/\D/g, '') + '@c.us' : message.from);
            const contact = await client.getContactById(target);
            const about = await contact.getAbout();
            const profilePic = await client.getProfilePicUrl(target);
            
            let res = `🕵️ *STALK REPORT*\n\n`;
            res += `👤 *Name:* ${contact.pushname || 'Unknown'}\n`;
            res += `📞 *Number:* ${contact.number}\n`;
            res += `📝 *About:* ${about || 'No bio'}\n`;
            res += `🔗 *Business:* ${contact.isBusiness ? 'Yes' : 'No'}\n`;
            res += `👥 *In My Contacts:* ${contact.isMyContact ? 'Yes' : 'No'}`;

            const replyTarget = message.fromMe ? message.to : message.from;
            if (profilePic) {
                const { MessageMedia } = require('whatsapp-web.js');
                const media = await MessageMedia.fromUrl(profilePic);
                await client.sendMessage(replyTarget, media, { caption: res });
            } else {
                await client.sendMessage(replyTarget, res);
            }
        } catch (e) {
            message.reply("❌ Error stalking user.");
        }
    }
};