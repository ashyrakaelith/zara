module.exports = {
    name: 'antiviewonce',
    description: 'Automatically converts View Once media to normal media.',
    async execute(client, message) {
        // Broad detection for View Once across different library versions
        const rawMsg = message._data;
        const isVO = message.isViewOnce || 
                     (rawMsg && (rawMsg.isViewOnce || rawMsg.viewOnce || (rawMsg.labels && rawMsg.labels.includes('viewOnce'))));

        if (isVO) {
            try {
                // Add a small delay to ensure media is ready
                await new Promise(r => setTimeout(r, 2000));
                
                const media = await message.downloadMedia();
                if (media) {
                    const target = message.fromMe ? message.to : message.from;
                    await client.sendMessage(target, media, {
                        caption: `✅ *Anti-View Once Detection*\n\nType: ${message.type}\nStatus: Saved Permanently`,
                        quotedMessageId: message.id._serialized
                    });
                } else {
                    console.error('Failed to download VO media - library might not support this type yet or network issue.');
                }
            } catch (err) {
                console.error('Anti-View Once Error:', err);
            }
        }
    }
};