require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
let qrCodeData = '';

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

app.get('/', (req, res) => {
    if (qrCodeData) {
        res.send(`
            <html>
                <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #f0f2f5;">
                    <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                        <h1 style="color: #128c7e;">WhatsApp Bot Login</h1>
                        <p>Scan the QR code below with your WhatsApp app</p>
                        <div id="qrcode"></div>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                        <script>
                            new QRCode(document.getElementById("qrcode"), "${qrCodeData}");
                        </script>
                        <p style="margin-top: 1rem; color: #667781; font-size: 0.9rem;">The bot will start once scanned.</p>
                    </div>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #f0f2f5;">
                    <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                        <h1 style="color: #128c7e;">WhatsApp Bot</h1>
                        <p>Waiting for QR code generation or bot is already online...</p>
                        <script>setTimeout(() => window.location.reload(), 5000);</script>
                    </div>
                </body>
            </html>
        `);
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Web preview available at port ${port}`);
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
    qrCodeData = qr;
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code above or via the web preview.');
});

client.on('ready', () => {
    qrCodeData = '';
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
