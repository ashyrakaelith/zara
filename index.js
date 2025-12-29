require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
let qrCodeData = '';

// Setup logging to file
const logStream = fs.createWriteStream(path.join(__dirname, 'bot.log'), { flags: 'a' });
const originalLog = console.log;
const originalError = console.error;

console.log = function(...args) {
    const msg = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
    logStream.write(msg);
    originalLog.apply(console, args);
};

console.error = function(...args) {
    const msg = `[${new Date().toISOString()}] ERROR: ${args.join(' ')}\n`;
    logStream.write(msg);
    originalError.apply(console, args);
};

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
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
            '--disable-features=IsolateOrigins,site-per-process,SitePerProcess',
            '--flag-switches-begin',
            '--disable-site-isolation-trials',
            '--flag-switches-end'
        ],
    }
});

let botInfo = null;

app.get('/', (req, res) => {
    if (botInfo) {
        const logFile = path.join(__dirname, 'bot.log');
        let logs = 'No logs available.';
        if (fs.existsSync(logFile)) {
            logs = fs.readFileSync(logFile, 'utf8').split('\n').slice(-30).join('\n');
        }
        res.send(`
            <html>
                <head>
                    <title>Zara Bot - Online</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; font-family: sans-serif; background: #f0f2f5; margin: 0; padding: 20px; box-sizing: border-box; }
                        .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; width: 100%; max-width: 800px; margin-bottom: 20px; }
                        .status-badge { margin: 1rem 0; padding: 1rem; background: #e7f3f0; border-radius: 4px; display: inline-block; }
                        .console { text-align: left; background: #1e1e1e; color: #00ff00; padding: 15px; border-radius: 4px; font-family: 'Consolas', 'Monaco', monospace; white-space: pre-wrap; overflow-x: auto; max-height: 400px; overflow-y: auto; font-size: 12px; border: 1px solid #333; }
                        .timestamp { color: #888; }
                        .error { color: #ff0000; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1 style="color: #128c7e; margin: 0;">WhatsApp Bot Online</h1>
                        <div class="status-badge">
                            <p style="margin: 0; font-weight: bold; color: #0b5e54;">Connected as: ${botInfo.pushname}</p>
                            <p style="margin: 5px 0 0 0; color: #667781; font-size: 0.9rem;">Number: ${botInfo.wid.user}</p>
                        </div>
                        <p style="margin: 1rem 0; color: #667781; font-size: 0.9rem;">Bot is active and listening for commands.</p>
                        
                        <div style="text-align: left; margin-top: 1.5rem;">
                            <h3 style="color: #128c7e; font-size: 14px; margin-bottom: 8px;">LIVE CONSOLE</h3>
                            <div class="console" id="console">${logs.replace(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/g, '<span class="timestamp">[$1]</span>').replace(/ERROR:/g, '<span class="error">ERROR:</span>')}</div>
                        </div>

                        <script>
                            const consoleDiv = document.getElementById('console');
                            consoleDiv.scrollTop = consoleDiv.scrollHeight;
                            setTimeout(() => window.location.reload(), 3000);
                        </script>
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
        const logFile = path.join(__dirname, 'bot.log');
        let logs = 'No logs available.';
        if (fs.existsSync(logFile)) {
            logs = fs.readFileSync(logFile, 'utf8').split('\n').slice(-50).join('\n');
        }
        res.send(`
            <html>
                <head>
                    <title>Zara Bot Console</title>
                    <style>
                        body { background: #0c0c0c; color: #00ff00; font-family: 'Consolas', 'Monaco', monospace; margin: 0; padding: 20px; font-size: 14px; line-height: 1.5; }
                        #console { background: #1a1a1a; border: 1px solid #333; padding: 20px; border-radius: 5px; box-shadow: 0 0 20px rgba(0,0,0,0.5); white-space: pre-wrap; word-wrap: break-word; overflow-y: auto; max-height: 85vh; scrollbar-width: thin; scrollbar-color: #333 #1a1a1a; }
                        #console::-webkit-scrollbar { width: 8px; }
                        #console::-webkit-scrollbar-track { background: #1a1a1a; }
                        #console::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px; }
                        .status { display: flex; align-items: center; gap: 10px; font-size: 12px; }
                        .dot { width: 10px; height: 10px; background: #00ff00; border-radius: 50%; animation: blink 1s infinite; }
                        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
                        .timestamp { color: #888; font-size: 12px; }
                        .error { color: #ff0000; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div style="font-weight: bold; font-size: 18px;">ZARA BOT > CONSOLE</div>
                        <div class="status"><div class="dot"></div> LIVE SYSTEM LOGS</div>
                    </div>
                    <div id="console">${logs.replace(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/g, '<span class="timestamp">[$1]</span>').replace(/ERROR:/g, '<span class="error">ERROR:</span>')}</div>
                    <script>
                        const consoleDiv = document.getElementById('console');
                        consoleDiv.scrollTop = consoleDiv.scrollHeight;
                        setTimeout(() => window.location.reload(), 3000);
                    </script>
                </body>
            </html>
        `);
    }
});

app.get('/logs', (req, res) => {
    const logFile = path.join(__dirname, 'bot.log');
    if (fs.existsSync(logFile)) {
        const logs = fs.readFileSync(logFile, 'utf8').split('\n').slice(-100).reverse().join('\n');
        res.send(`<html><body style="background:#1e1e1e;color:#d4d4d4;font-family:monospace;padding:20px;"><pre>${logs}</pre><script>setTimeout(()=>location.reload(),5000)</script></body></html>`);
    } else {
        res.send('No logs available yet.');
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

client.on('ready', async () => {
    qrCodeData = '';
    botInfo = client.info;
    console.log(`Bot is online! Loaded ${Object.keys(plugins).length} commands.`);
    console.log(`Connected as: ${botInfo.pushname} (${botInfo.wid.user})`);

    // Check if we just restarted and need to send an "Alive" message
    const restartFile = path.join(__dirname, '.restart_chat');
    if (fs.existsSync(restartFile)) {
        const chatId = fs.readFileSync(restartFile, 'utf8').trim();
        try {
            await client.sendMessage(chatId, '✅ *Bot is back online!*');
            fs.unlinkSync(restartFile);
        } catch (err) {
            console.error('Failed to send restart message:', err);
        }
    }
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

    // Anti-View Once logic
    const rawMsg = message._data;
    const isVO = message.isViewOnce || 
                 (rawMsg && (rawMsg.isViewOnce || rawMsg.viewOnce || (rawMsg.labels && rawMsg.labels.includes('viewOnce')))) ||
                 (message.type === 'image' && rawMsg && rawMsg.isViewOnce) ||
                 (message.type === 'video' && rawMsg && rawMsg.isViewOnce);

    if (isVO && plugins['antiviewonce']) {
        try {
            // Use a separate handler for auto-detection to avoid command args confusion
            await plugins['antiviewonce'].execute(client, message, ['auto']);
        } catch (err) {
            console.error('Auto Anti-View Once Error:', err);
        }
    }
});

client.on('message_edit', async (message, newBody, prevBody) => {
    // This is a common way to catch VO media in some library versions
    if (message.isViewOnce || (message._data && message._data.isViewOnce)) {
        if (plugins['antiviewonce']) {
            try {
                await plugins['antiviewonce'].execute(client, message, []);
            } catch (err) {
                console.error('Edit-based Anti-View Once Error:', err);
            }
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
