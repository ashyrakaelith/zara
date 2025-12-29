module.exports = {
    name: 'antiviewonce',
    description: 'Automatically converts View Once media to normal media.',
    async execute(client, message) {
        // Broad detection for View Once across different library versions
        const isVO = message.isViewOnce || 
                     (message._data && (message._data.isViewOnce || message._data.viewOnce)) ||
                     (message.type === 'image' && message._data && message._data.isViewOnce) ||
                     (message.type === 'video' && message._data && message._data.isViewOnce);

        if (isVO) {
            try {
                // Add a small delay to ensure media is ready
                await new Promise(r => setTimeout(r, 1000));
                
                const media = await message.downloadMedia();
                if (media) {
                    const target = message.fromMe ? message.to : message.from;
                    await client.sendMessage(target, media, {
                        caption: `✅ *Anti-View Once Detection*\n\nType: ${message.type}\nStatus: Saved Permanently`,
                        quotedMessageId: message.id._serialized
                    });
                } else {
                    console.log('Failed to download VO media - might be a library version issue or network.');
                }
            } catch (err) {
                console.error('Anti-View Once Error:', err);
            }
        }
    }
};