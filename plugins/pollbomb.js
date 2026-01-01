module.exports = {
    name: 'pollbomb',
    description: 'Bypass Protobuf limits using optimized payload size',
    async execute(client, message, args) {
        // Reduced repeat to stay within Byte limits (Protobuf safe)
        const heavyText = "𝕿𝖍𝖎𝖘 𝖘𝖞𝖘𝖙𝖊𝖒 𝖎𝖘 𝖚𝖓𝖉𝖊𝖗 𝖆𝖙𝖙𝖆𝖈𝖐 ".repeat(5);
        const title = "⚠️ SYSTEM OVERLOAD ⚠️";

        const options = [
            "🔴 ERR_01: " + heavyText,
            "🟠 ERR_02: " + heavyText,
            "🟡 ERR_03: " + heavyText,
            "🟢 ERR_04: " + heavyText
        ];

        try {
            await client.sendMessage(message.from, {
                poll: {
                    name: title,
                    options: options,
                    selectableCount: 1
                }
            });
            console.log("✔️ Optimized Poll sent successfully.");
        } catch (e) {
            console.error("Validation Error:", e.message);
            message.reply("❌ Server still blocking. The Protobuf validator is too strict for Polls.");
        }
    }
};