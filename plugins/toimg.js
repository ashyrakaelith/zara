const sharp = require('sharp');

module.exports = {
    name: 'toimg',
    description: 'Convert a sticker to an image and remove white borders.',
    async execute(client, message, args) {
        try {
            let targetMessage = message;

            if (message.hasQuotedMsg) {
                targetMessage = await message.getQuotedMessage();
            }

            if (targetMessage.type !== 'sticker') {
                return message.reply('❌ Please reply to a sticker.');
            }

            const media = await targetMessage.downloadMedia();
            if (!media) return message.reply('❌ Failed to download sticker.');

            // Use sharp to trim transparent/white borders
            const buffer = Buffer.from(media.data, 'base64');
            const trimmedBuffer = await sharp(buffer)
                .trim() // Automatically removes borders based on transparency/color
                .toFormat('png')
                .toBuffer();

            media.data = trimmedBuffer.toString('base64');
            media.mimetype = 'image/png';
            media.filename = 'sticker.png';

            const target = message.fromMe ? message.to : message.from;
            await client.sendMessage(target, media, {
                caption: '✅ Converted sticker (borders removed).',
                sendMediaAsDocument: false
            });

        } catch (error) {
            console.error('ToImg Error:', error);
            message.reply('❌ Error: Could not process image.');
        }
    }
};