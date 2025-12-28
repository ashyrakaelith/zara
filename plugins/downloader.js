const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'downloader',
    description: 'Download videos or audio from supported URLs.',
    async execute(client, message, args) {
        const url = args[0];
        const format = args[1]; // 'mp3' or 'mp4'

        if (!url) {
            return message.reply("Usage: .downloader [url] [mp3/mp4]\nExample: .downloader https://youtube.com/watch?v=... mp4");
        }

        if (!['mp3', 'mp4'].includes(format)) {
            return message.reply("Please choose a format: mp3 or mp4.");
        }

        // Basic XXX block (placeholder list, can be expanded)
        const blockedKeywords = ['porn', 'xxx', 'xvideos', 'redtube', 'pornhub', 'hentai', 'rule34'];
        if (blockedKeywords.some(keyword => url.toLowerCase().includes(keyword))) {
            return message.reply("⚠️ This website/content is blocked.");
        }

        message.reply(`⏳ Processing your request... Please wait.`);

        const outputName = `download_${Date.now()}.${format === 'mp3' ? 'mp3' : 'mp4'}`;
        const outputPath = path.join(__dirname, '..', outputName);

        // Command construction
        let command;
        if (format === 'mp3') {
            command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;
        } else {
            command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${outputPath}" "${url}"`;
        }

        exec(command, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return message.reply("❌ Failed to download. Make sure the URL is valid and supported.");
            }

            try {
                if (fs.existsSync(outputPath)) {
                    const media = MessageMedia.fromFilePath(outputPath);
                    await client.sendMessage(message.from, media, {
                        sendAudioAsVoice: false,
                        caption: `✅ Downloaded successfully!`,
                        unsafeIgnoreMessageHandlerErrors: true
                    });
                    
                    // Cleanup
                    fs.unlinkSync(outputPath);
                } else {
                    message.reply("❌ File not found after download.");
                }
            } catch (err) {
                console.error(err);
                message.reply("❌ Error sending the file.");
            }
        });
    }
};
