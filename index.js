require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
let qrCodeData = '';

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    const lockPath = path.join(__dirname, '.wwebjs_auth', 'session-bot', 'SingletonLock');
    if (err.message.includes('SingletonLock') || true) { // Always check on exception
        if (fs.existsSync(lockPath)) {
            try {
                fs.unlinkSync(lockPath);
                console.log('Cleared stale lock on exception.');
            } catch (e) {
                console.error('Failed to clear lock:', e);
            }
        }
    }
});

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
            '--disable-software-rasterizer',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ],
    }
});

let botInfo = null;

app.get('/', (req, res) => {
    if (botInfo) {
        res.send(`
            <html>
                <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #f0f2f5;">
                    <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                        <h1 style="color: #128c7e;">WhatsApp Bot Online</h1>
                        <div style="margin: 1rem 0; padding: 1rem; background: #e7f3f0; border-radius: 4px; display: inline-block;">
                            <p style="margin: 0; font-weight: bold; color: #0b5e54;">Connected as: ${botInfo.pushname}</p>
                            <p style="margin: 5px 0 0 0; color: #667781; font-size: 0.9rem;">Number: ${botInfo.wid.user}</p>
                        </div>
                        <p style="margin-top: 1rem; color: #667781; font-size: 0.9rem;">Bot is active and listening for commands.</p>
                        <script>setTimeout(() => window.location.reload(), 30000);</script>
                    </div>
                </body>
            </html>
        `);
    } else if (qrCodeData) {
        res.send(`
            <html>
                <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #f0f2f5;">
                    <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
                        <h1 style="color: #128c7e;">WhatsApp Bot Login</h1>
                        <p>Scan the QR code below with your WhatsApp app</p>
                        <div id="qrcode" style="display: flex; justify-content: center; margin: 20px 0;"></div>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                        <script>
                            new QRCode(document.getElementById("qrcode"), {
                                text: "${qrCodeData}",
                                width: 256,
                                height: 256
                            });
                        </script>
                        <p style="margin-top: 1rem; color: #667781; font-size: 0.9rem;">The bot will start once scanned.</p>
                        <script>setTimeout(() => window.location.reload(), 10000);</script>
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
                        <p>Initializing or connecting...</p>
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
    // qrcode.generate(qr, { small: true }); // Disabled console QR to avoid PM2 log spam
    console.log('New QR code generated. View it in the web preview.');
});

client.on('ready', () => {
    qrCodeData = '';
    botInfo = client.info;
    console.log(`Bot is online! Loaded ${Object.keys(plugins).length} commands.`);
    console.log(`Connected as: ${botInfo.pushname} (${botInfo.wid.user})`);
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

// Error handling for the client initialization
const initializeClient = () => {
    client.initialize().catch(err => {
        console.error('Failed to initialize WhatsApp client:', err);
        const lockPath = path.join(__dirname, '.wwebjs_auth', 'session-bot', 'SingletonLock');
        if (fs.existsSync(lockPath)) {
            try {
                fs.unlinkSync(lockPath);
                console.log('Cleared stale lock, retrying in 5 seconds...');
                setTimeout(initializeClient, 5000);
            } catch (e) {
                console.error('Failed to clear lock:', e);
            }
        }
    });
};

initializeClient();
