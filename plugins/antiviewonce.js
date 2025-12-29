module.exports = {
    name: 'antiviewonce',
    description: 'Automatically converts View Once media to normal media.',
    async execute(client, message) {
        try {
            // Broad detection for View Once across different library versions
            const rawMsg = message._data;
            const isVO = message.isViewOnce || 
                         (rawMsg && (rawMsg.isViewOnce || rawMsg.viewOnce || (rawMsg.labels && rawMsg.labels.includes('viewOnce')))) ||
                         (message.type === 'image' && rawMsg && rawMsg.isViewOnce) ||
                         (message.type === 'video' && rawMsg && rawMsg.isViewOnce);

            if (isVO) {
                console.log('[Anti-ViewOnce] View Once media detected. Attempting download...');
                // Add a small delay to ensure media is ready
                await new Promise(r => setTimeout(r, 2000));
                
                const media = await message.downloadMedia();
                if (media) {
                    const target = message.fromMe ? message.to : message.from;
                    await client.sendMessage(target, media, {
                        caption: `✅ *Anti-View Once System*\n\nType: ${message.type}\nStatus: Converted to Permanent`,
                        quotedMessageId: message.id._serialized
                    });
                    console.log('[Anti-ViewOnce] Media successfully converted and sent.');
                } else {
                    console.error('[Anti-ViewOnce] Failed to download media.');
                }
            }
        } catch (err) {
            console.error('[Anti-ViewOnce] Plugin Error:', err);
        }
    }
};