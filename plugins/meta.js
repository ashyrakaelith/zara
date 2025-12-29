module.exports = {
    name: 'meta',
    description: 'Get metadata of an image/video.',
    async execute(client, message) {
        try {
            const targetMsg = message.hasQuotedMsg ? await message.getQuotedMessage() : message;
            
            if (!targetMsg.hasMedia) {
                return message.reply("❌ Please reply to an image or video to get its metadata.");
            }

            const rawData = targetMsg._data;
            let meta = `📊 *MEDIA METADATA*\n\n`;
            meta += `📝 *Type:* ${targetMsg.type}\n`;
            meta += `📏 *Size:* ${(rawData.size / 1024).toFixed(2)} KB\n`;
            meta += `⏳ *Duration:* ${rawData.duration || 'N/A'}s\n`;
            meta += `🖼️ *Dimensions:* ${rawData.width || 'N/A'}x${rawData.height || 'N/A'}\n`;
            meta += `🆔 *Mime:* ${targetMsg.mime}\n`;
            meta += `👁️ *View Once:* ${targetMsg.isViewOnce ? 'Yes' : 'No'}\n`;
            
            if (rawData.caption) {
                meta += `🖋️ *Caption:* ${rawData.caption}\n`;
            }

            const targetChat = message.fromMe ? message.to : message.from;
            await client.sendMessage(targetChat, meta, { quotedMessageId: targetMsg.id._serialized });
        } catch (error) {
            console.error('Meta Command Error:', error);
            message.reply("❌ Error fetching metadata.");
        }
    }
};