module.exports = {
    name: 's',
    description: 'Convert an image or video to a sticker.',
    async execute(client, message, args) {
        try {
            const mediaMsg = message.hasMedia ? message : (message.hasQuotedMsg ? await message.getQuotedMessage() : null);
            
            if (mediaMsg && mediaMsg.hasMedia) {
                const media = await mediaMsg.downloadMedia();
                if (!media) return message.reply("❌ Failed to download media.");

                const target = message.fromMe ? message.to : message.from;
                await client.sendMessage(target, media, {
                    sendMediaAsSticker: true,
                    stickerName: "ZARA BY D_NIWAN",
                    stickerAuthor: "ZARA | Z4R4"
                });
            } else {
                await message.reply("Reply to an image/video with .s");
            }
        } catch (error) {
            console.error('Sticker Error:', error);
            await message.reply("❌ Error creating sticker. Make sure the media is valid.");
        }
    }
};