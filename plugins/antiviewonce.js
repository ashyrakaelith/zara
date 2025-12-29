module.exports = {
    name: 'an',
    description: 'Convert view-once media to permanent.',
    async execute(client, message, args) {
        try {
            const isAuto = args && args[0] === 'auto';
            const quotedMsg = message.hasQuotedMsg ? await message.getQuotedMessage() : null;
            let targetMsg = quotedMsg || message;

            // Broad detection for View Once
            const rawMsg = targetMsg._data;
            const isVO = targetMsg.isViewOnce || 
                         (rawMsg && (rawMsg.isViewOnce || rawMsg.viewOnce || (rawMsg.labels && rawMsg.labels.includes('viewOnce')))) ||
                         (targetMsg.type === 'image' && rawMsg && rawMsg.isViewOnce) ||
                         (targetMsg.type === 'video' && rawMsg && rawMsg.isViewOnce);

            if (!isVO && !isAuto) {
                return message.reply("❌ This is not a view-once message. Reply to one with .an");
            }

            if (!isVO) return; // Silent return for auto if not VO

            const target = message.fromMe ? message.to : message.from;
            
            // Wait for media to be ready on WhatsApp servers
            await new Promise(r => setTimeout(r, 2000));

            const media = await targetMsg.downloadMedia();
            if (media) {
                await client.sendMessage(target, media, {
                    caption: `✅ *Anti-View Once System*\n\nType: ${targetMsg.type}\nStatus: Converted`,
                    quotedMessageId: targetMsg.id._serialized
                });
            } else {
                // If download fails, try one more time after a longer delay
                await new Promise(r => setTimeout(r, 3000));
                const retryMedia = await targetMsg.downloadMedia();
                if (retryMedia) {
                    await client.sendMessage(target, retryMedia, {
                        caption: `✅ *Anti-View Once System (Retry)*\n\nType: ${targetMsg.type}\nStatus: Converted`,
                        quotedMessageId: targetMsg.id._serialized
                    });
                } else {
                    throw new Error("Failed to download media. WhatsApp might have already restricted access to this view-once file.");
                }
            }
        } catch (err) {
            console.error('[Anti-ViewOnce] Error:', err);
            // Only send error message to chat for manual commands or critical failures
            if (args && args[0] !== 'auto') {
                const target = message.fromMe ? message.to : message.from;
                await client.sendMessage(target, `❌ *Anti-View Once Error*\n\n${err.message}`);
            }
        }
    }
};