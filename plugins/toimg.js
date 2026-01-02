const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'toimg',
    description: 'Convert a sticker to an image.',
    async execute(client, message, args) {
        try {
            let targetMessage = message;

            // Check if it's a reply to a sticker
            if (message.hasQuotedMsg) {
                targetMessage = await message.getQuotedMessage();
            }

            // Verify the message contains a sticker
            if (targetMessage.type !== 'sticker') {
                return message.reply('❌ Please reply to a sticker or send a sticker with this command.');
            }

            // Download the media from the sticker
            const media = await targetMessage.downloadMedia();
            
            if (!media) {
                return message.reply('❌ Failed to download sticker media.');
            }

            // Send back as an image
            const target = message.fromMe ? message.to : message.from;
            await client.sendMessage(target, media, {
                caption: '✅ Converted sticker to image.',
                sendMediaAsDocument: false
            });

        } catch (error) {
            console.error('ToImg Command Error:', error);
            message.reply('❌ An error occurred while converting the sticker.');
        }
    }
};