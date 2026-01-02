module.exports = {
    name: 'slow',
    description: 'Send a large message to test chat rendering.',
    async execute(client, message, args) {
        const target = message.fromMe ? message.to : message.from;
        let payload = '⚠️ *System Lag Test* ⚠️\n\n';
        for(let i=0; i<1000; i++) payload += 'LAG-TEST-STABILITY-CHECK ';
        await client.sendMessage(target, payload);
    }
};