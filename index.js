require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bot' }),
    puppeteer: {
        handleSIGINT: false,
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-software-rasterizer'
        ],
    }
});

const plugins = {};
const pluginPath = path.join(__dirname, 'plugins');

// Auto-load plugins from the folder
if (fs.existsSync(pluginPath)) {
    const files = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));
    for (const file of files) {
        const plugin = require(`./plugins/${file}`);
        if (plugin.name) plugins[plugin.name] = plugin;
    }
}

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code above.');
});

client.on('ready', () => {
    console.log(`Bot is online! Loaded ${Object.keys(plugins).length} commands.`);
});

client.on('message_create', async (message) => {
    const prefix = '.';
    if (message.isStatus || !message.body.startsWith(prefix)) return;

    const args = message.body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (plugins[commandName]) {
        try {
            // Passing 'plugins' so the menu can see all commands
            await plugins[commandName].execute(client, message, args, plugins);
        } catch (err) {
            console.error(`Error in ${commandName}:`, err);
            message.reply('⚠️ Error executing command.');
        }
    }
});

client.initialize();
