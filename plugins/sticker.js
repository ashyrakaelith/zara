module.exports = {
    name: 's',
    async execute(client, message, args) {
        const mediaMsg = message.hasMedia ? message : (message.hasQuotedMsg ? await message.getQuotedMessage() : null);
        
        if (mediaMsg && mediaMsg.hasMedia) {
            const media = await mediaMsg.downloadMedia();
            await client.sendMessage(message.from, media, {
                sendMediaAsSticker: true,
                stickerName: "My Bot",
                stickerAuthor: "Gemini"
            });
        } else {
            await message.reply("Reply to an image/video with .s");
        }
    }
};