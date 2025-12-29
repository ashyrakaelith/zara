module.exports = {
    name: 'antiviewonce',
    description: 'Automatically converts View Once media to normal media.',
    async execute(client, message) {
        // This is a listener-based plugin, but we can also trigger it manually if needed
        if (message.isViewOnce || (message._data && message._data.isViewOnce)) {
            try {
                const media = await message.downloadMedia();
                if (media) {
                    const target = message.fromMe ? message.to : message.from;
                    await client.sendMessage(target, media, {
                        caption: `✅ *Anti-View Once Detection*\n\nUser sent a View Once ${message.type}. Here it is permanently.`,
                        quotedMessageId: message.id._serialized
                    });
                }
            } catch (err) {
                console.error('Anti-View Once Error:', err);
            }
        }
    }
};