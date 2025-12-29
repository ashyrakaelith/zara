const { exiftool } = require('exiftool-vendored');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'meta',
    description: 'Get deep EXIF metadata of an image/video.',
    async execute(client, message) {
        try {
            const targetMsg = message.hasQuotedMsg ? await message.getQuotedMessage() : message;
            
            if (!targetMsg.hasMedia) {
                return message.reply("❌ Please reply to an image or video to get its metadata.");
            }

            const target = message.fromMe ? message.to : message.from;
            const media = await targetMsg.downloadMedia();
            if (!media) return message.reply("❌ Failed to download media for analysis.");

            // Save temporarily to disk for exiftool
            const tmpFile = path.join(__dirname, `../tmp_meta_${Date.now()}.${targetMsg.type === 'image' ? 'jpg' : 'mp4'}`);
            fs.writeFileSync(tmpFile, media.data, { encoding: 'base64' });

            const tags = await exiftool.read(tmpFile);
            
            let meta = `📊 *DEEP MEDIA METADATA*\n\n`;
            
            // Descriptive
            meta += `📝 *DESCRIPTIVE*\n`;
            meta += `- Type: ${tags.FileType || targetMsg.type}\n`;
            meta += `- MIME: ${tags.MIMEType || targetMsg.mime}\n`;
            meta += `- Description: ${tags.ImageDescription || tags.Description || 'N/A'}\n`;
            meta += `- Keywords: ${tags.Keywords || 'N/A'}\n\n`;

            // Administrative
            meta += `⚙️ *ADMINISTRATIVE*\n`;
            meta += `- Create Date: ${tags.CreateDate || tags.DateTimeOriginal || 'N/A'}\n`;
            meta += `- Software: ${tags.Software || 'N/A'}\n`;
            meta += `- Dimensions: ${tags.ImageWidth || 'N/A'}x${tags.ImageHeight || 'N/A'}\n`;
            meta += `- Size: ${(fs.statSync(tmpFile).size / 1024).toFixed(2)} KB\n\n`;

            // Rights
            meta += `⚖️ *RIGHTS*\n`;
            meta += `- Artist/Creator: ${tags.Artist || tags.Creator || 'N/A'}\n`;
            meta += `- Copyright: ${tags.Copyright || 'N/A'}\n`;

            await client.sendMessage(target, meta, { quotedMessageId: targetMsg.id._serialized });

            // Cleanup
            fs.unlinkSync(tmpFile);
        } catch (error) {
            console.error('Meta Command Error:', error);
            message.reply("❌ Error fetching deep metadata. The file might not contain EXIF data.");
        }
    }
};