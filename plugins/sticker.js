module.exports = {
    name: 's',
    description: 'Convert an image or video to a sticker.',
    async execute(client, message, args) {
        const mediaMsg = message.hasMedia ? message : (message.hasQuotedMsg ? await message.getQuotedMessage() : null);
        
        if (mediaMsg && mediaMsg.hasMedia) {
            const media = await mediaMsg.downloadMedia();
            await client.sendMessage(message.from, media, {
                sendMediaAsSticker: true,
                stickerName: "ZARA BY D_NIWAN",
                stickerAuthor: "ZARA | Z4R4"
            });
        } else {
            await message.reply("Reply to an image/video with .s");
        }
    }
};