module.exports = {
    name: 'an',
    description: 'Manually convert a quoted view-once message.',
    async execute(client, message, args) {
        try {
            const quotedMsg = message.hasQuotedMsg ? await message.getQuotedMessage() : null;
            const targetMsg = quotedMsg || message;

            const rawMsg = targetMsg._data;
            const isVO = targetMsg.isViewOnce || 
                         (rawMsg && (rawMsg.isViewOnce || rawMsg.viewOnce || (rawMsg.labels && rawMsg.labels.includes('viewOnce')))) ||
                         (targetMsg.type === 'image' && rawMsg && rawMsg.isViewOnce) ||
                         (targetMsg.type === 'video' && rawMsg && rawMsg.isViewOnce);

            if (!isVO && !quotedMsg) {
                return message.reply("❌ This is not a view-once message. Reply to one with .an");
            }

            const target = message.fromMe ? message.to : message.from;
            // Removed manual reply to avoid race conditions with downloadMedia
            
            // Add a small delay to allow media to fully "settle" on WA servers
            await new Promise(r => setTimeout(r, 1500));

            const media = await targetMsg.downloadMedia();
            if (media) {
                await client.sendMessage(target, media, {
                    caption: `✅ *Manual Anti-View Once*\n\nType: ${targetMsg.type}\nStatus: Converted`,
                    quotedMessageId: targetMsg.id._serialized
                });
            } else {
                throw new Error("Failed to download media. It might have expired or been deleted.");
            }
        } catch (err) {
            console.error('[Anti-ViewOnce] Error:', err);
            const target = message.fromMe ? message.to : message.from;
            await client.sendMessage(target, `❌ *Anti-View Once Error*\n\n${err.message}`);
        }
    }
};