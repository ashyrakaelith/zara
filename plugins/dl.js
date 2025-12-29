const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'dl',
    description: 'Download audio/video from various sites.',
    async execute(client, message, args) {
        const url = args[0];
        const format = args[1] ? args[1].toLowerCase() : 'mp3'; // Default to mp3 if not specified

        if (!url || !url.startsWith('http')) {
            return message.reply("❌ Usage: .dl [url] [mp3/mp4]\nExample: .dl https://youtube.com/watch?v=xxx mp4");
        }

        // Safety Filter
        const blockedKeywords = ['porn', 'xxx', 'xvideos', 'redtube', 'pornhub', 'hentai', 'rule34', 'xhamster'];
        if (blockedKeywords.some(keyword => url.toLowerCase().includes(keyword))) {
            return message.reply("⚠️ Content blocked by safety filter.");
        }

        message.reply(`⏳ Downloading your ${format.toUpperCase()}... please wait.`);

        // Create a unique filename in the current directory
        const fileName = `dl_${Date.now()}.${format === 'mp3' ? 'mp3' : 'mp4'}`;
        const outputPath = path.resolve(__dirname, '..', fileName);

        // yt-dlp Command construction
        let command;
        if (format === 'mp3') {
            command = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${url}"`;
        } else {
            // Forces mp4 format
            command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${outputPath}" "${url}"`;
        }

        exec(command, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Download Error: ${error.message}`);
                const errorMsg = error.message.toLowerCase();
                if (errorMsg.includes('not supported') || errorMsg.includes('unavailable')) {
                    return message.reply("❌ This site is not supported or the video is private.");
                }
                return message.reply("❌ Download failed. The URL might be broken or the site is unsupported.");
            }

            try {
                if (fs.existsSync(outputPath)) {
                    const media = MessageMedia.fromFilePath(outputPath);
                    const target = message.fromMe ? message.to : message.from;
                    
                    await client.sendMessage(target, media, {
                        sendAudioAsVoice: false, // Sends as a proper audio file
                        caption: `✅ *Source:* ${url}`,
                        unsafeIgnoreMessageHandlerErrors: true,
                        sendMediaAsDocument: true
                    });

                    // Cleanup: Delete file after sending
                    fs.unlinkSync(outputPath);
                } else {
                    message.reply("❌ Error: Downloaded file not found on server.");
                }
            } catch (err) {
                console.error('Sending Error:', err);
                message.reply("❌ Error sending the file. It might be too large.");
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }
        });
    }
};
