process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'
import './config.js'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import {createRequire} from 'module'
import {fileURLToPath, pathToFileURL} from 'url'
import {platform} from 'process'
import * as ws from 'ws'
import fs, {readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch} from 'fs'
import yargs from 'yargs'
import {spawn} from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import os, {tmpdir} from 'os'
import {format} from 'util'
import boxen from 'boxen'
import P from 'pino'
import pino from 'pino'
import Pino from 'pino'
import path, { join, dirname } from 'path'
import {Boom} from '@hapi/boom'
import {makeWASocket, protoType, serialize} from './lib/simple.js'
import {Low, JSONFile} from 'lowdb'
import {mongoDB, mongoDBV2} from './lib/mongoDB.js'
import store from './lib/store.js'
const {proto} = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const {DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, Browsers} = await import('@whiskeysockets/baileys')
import readline, { createInterface } from 'readline'
import NodeCache from 'node-cache'
const {CONNECTING} = ws
const {chain} = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

let { say } = cfonts

// Definir variables globales necesarias
global.sessions = global.sessions || 'sessions'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function showBanner() {
    const title = `

    `.split('\n').map(line => chalk.hex('#ff00cc').bold(line)).join('\n')

    const subtitle = chalk.hex('#00eaff').bold('✦ KELOKEBOT ✦').padStart(40)
    const poweredMsg = chalk.hex('#00eaff').italic('powered by German')
    const aiMsg = chalk.hex('#ffb300').bold('🤖 KelokeBot - Tu compañero virtual')
    const tips = [
        chalk.hex('#ffb300')('💡 Tip: Usa /help para ver los comandos disponibles.'),
        chalk.hex('#00eaff')('📋 Síguenos en GitHub para actualizaciones.'),
        chalk.hex('#ff00cc')('✨ Disfruta de la experiencia premium de Keloke.')
    ]
    const loadingFrames = [
        chalk.magentaBright('⠋ Cargando módulos...'),
        chalk.magentaBright('⠙ Cargando módulos...'),
        chalk.magentaBright('⠹ Cargando módulos...'),
        chalk.magentaBright('⠸ Cargando módulos...'),
        chalk.magentaBright('⠼ Cargando módulos...'),
        chalk.magentaBright('⠴ Cargando módulos...'),
        chalk.magentaBright('⠦ Cargando módulos...'),
        chalk.magentaBright('⠧ Cargando módulos...'),
        chalk.magentaBright('⠇ Cargando módulos...'),
        chalk.magentaBright('⠏ Cargando módulos...')
    ]

    console.clear()
   
    console.log(
        boxen(
            title + '\n' + subtitle,
            {
                padding: 1,
                margin: 1,
                borderStyle: 'double',
                borderColor: 'whiteBright',
                backgroundColor: 'black',
                title: 'Keloke',
                titleAlignment: 'center'
            }
        )
    )

    say('Keloke', {
        font: 'block',
        align: 'center',
        colors: ['blue', 'cyan'],
        background: 'transparent',
        letterSpacing: 1,
        lineHeight: 1
    })
    say('powered by German', {
        font: 'console',
        align: 'center',
        colors: ['blue'],
        background: 'transparent'
    })
    console.log('\n' + aiMsg + '\n')

    // Animación de carga
    for (let i = 0; i < 18; i++) {
        process.stdout.write('\r' + loadingFrames[i % loadingFrames.length])
        await sleep(70)
    }
    process.stdout.write('\r' + ' '.repeat(40) + '\r') 

    // Mensaje de bienvenida
    console.log(
        chalk.bold.cyanBright(
            boxen(
                chalk.bold('¡Bienvenido a Keloke!\n') +
                chalk.hex('#00eaff')('El bot está arrancando, por favor espere...') +
                '\n' +
                tips.join('\n'),
                {
                    padding: 1,
                    margin: 1,
                    borderStyle: 'round',
                    borderColor: 'yellow'
                }
            )
        )
    )
    
    // Efecto de "sparkle" final
    const sparkles = [
        chalk.hex('#ff00cc')('✦'), chalk.hex('#00eaff')('✦'), chalk.hex('#ffb300')('✦'),
        chalk.hex('#00eaff')('✦'), chalk.hex('#ff00cc')('✦'), chalk.hex('#ffb300')('✦')
    ]
    let sparkleLine = ''
    for (let i = 0; i < 30; i++) {
        sparkleLine += sparkles[i % sparkles.length]
    }
    console.log('\n' + sparkleLine + '\n')
}

// Ejecutar el banner
await showBanner()
protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
return path.dirname(global.__filename(pathURL, true))
}; global.__require = function require(dir = import.meta.url) {
return createRequire(dir)
}

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({...query, ...(apikeyqueryname ? {[apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name]} : {})})) : '');

global.timestamp = {start: new Date}

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[#/!.]')

// Crear adaptador de base de datos según el tipo
const createDBAdapter = (dbUrl) => {
  if (/https?:\/\//.test(dbUrl)) {
    try {
      return new mongoDB(dbUrl)
    } catch (e) {
      console.log(chalk.yellow('⚠️ MongoDB no disponible, usando JSON local'))
      return new JSONFile('./database.json')
    }
  }
  return new JSONFile('./database.json')
}

global.db = new Low(createDBAdapter(opts['db'] || ''))

global.DATABASE = global.db 
global.loadDatabase = async function loadDatabase() {
if (global.db.READ) {
return new Promise((resolve) => setInterval(async function() {
if (!global.db.READ) {
clearInterval(this)
resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
}}, 1 * 1000))
}
if (global.db.data !== null) return
global.db.READ = true
await global.db.read().catch(console.error)
global.db.READ = null
global.db.data = {
users: {},
chats: {},
stats: {},
msgs: {},
sticker: {},
settings: {},
...(global.db.data || {}),
}
global.db.chain = chain(global.db.data)
}
loadDatabase()

const {state, saveState, saveCreds} = await useMultiFileAuthState(global.sessions)
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache()
const {version} = await fetchLatestBaileysVersion();
let phoneNumber = global.botNumber

const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
const colores = chalk.bgMagenta.white
const opcionQR = chalk.bold.green
const opcionTexto = chalk.bold.cyan
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

let opcion
if (methodCodeQR) {
opcion = '1'
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.sessions}/creds.json`)) {
do {
opcion = await question(`
╭─────────────────────────────◉
│ ${chalk.red.bgBlueBright.bold('    ⚙ MÉTODO DE CONEXIÓN BOT    ')}
│「 💡 」${chalk.yellow('Selecciona cómo quieres conectarte')}
│「 📲 」${chalk.yellow.bgRed.bold('1. Escanear Código QR')}
│「 🔑 」${chalk.red.bgGreenBright.bold('2. Código de Emparejamiento')}
│
│「 ℹ️ 」${chalk.gray('Usa el código si tienes problemas con el QR')}
│「 🚀 」${chalk.gray('Ideal para la primera configuración')}
│
│ ${chalk.bold.bgGreen.bold('📦 COMANDOS DISPONIBLES')}
│「 🛠️ 」${chalk.bold('npm run qr')}     ${chalk.gray('# Inicia con QR')}
│「 🛠️ 」${chalk.bold('npm run code')}   ${chalk.gray('# Inicia con código')}
│「 🛠️ 」${chalk.bold('npm start')}      ${chalk.gray('# Inicia normalmente')}
╰─────────────────────────────◉
${chalk.magenta('--->')} ${chalk.bold('Elige (1 o 2): ')}`.trim());

if (!/^[1-2]$/.test(opcion)) {
    console.log(chalk.redBright('✖ Opción inválida. Solo se permite 1 o 2.'));
}} while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.sessions}/creds.json`))
}

console.info = () => {} 
console.debug = () => {}
const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser: opcion == '1' ? Browsers.macOS("Desktop") : methodCodeQR ? Browsers.macOS("Desktop") : Browsers.macOS("Chrome"),
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, P({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  autoTyping: true,
  readGroup: true,
  readPrivate: true,
  syncFullHistory: false,
  downloadHistory: false,
  getMessage: async (clave) => {
    let jid = jidNormalizedUser(clave.remoteJid)
    let msg = await store.loadMessage(jid, clave.id)
    return msg?.message || ""
  },
  msgRetryCounterCache,
  msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,
  version
}

global.conn = makeWASocket(connectionOptions);

if (!fs.existsSync(`./${global.sessions}/creds.json`)) {
if (opcion === '2' || methodCode) {
opcion = '2'
if (!conn.authState.creds.registered) {
let addNumber
if (!!phoneNumber) {
addNumber = phoneNumber.replace(/[^0-9]/g, '')
} else {
do {
phoneNumber = await question(`
╭─────────────────────────────◉
│ ${chalk.black.bgGreenBright.bold('  📞 INGRESO DE NÚMERO WHATSAPP  ')}
│「 ✨ 」${chalk.whiteBright('Introduce tu número con prefijo de país')}
│「 🧾 」${chalk.yellowBright('Ejemplo: 57321XXXXXXX')}
╰─────────────────────────────◉
${chalk.magentaBright('--->')} ${chalk.bold.greenBright('Número: ')}`.trim());

phoneNumber = phoneNumber.replace(/\D/g, '');
if (!phoneNumber.startsWith('+')) {
    phoneNumber = `+${phoneNumber}`;
}

if (!await isValidPhoneNumber(phoneNumber)) {
    console.log(chalk.redBright('✖ El número ingresado no es válido. Inténtalo nuevamente.\n'));
}

} while (!await isValidPhoneNumber(phoneNumber));

rl.close();

const addNumber = phoneNumber.replace(/\D/g, '');

setTimeout(async () => {
    let codeBot = await conn.requestPairingCode(addNumber);
    codeBot = codeBot?.match(/.{1,4}/g)?.join('-') || codeBot;

    console.log(`
╭─────────────────────────────◉
│ ${chalk.black.bgMagentaBright.bold('🔐 CÓDIGO DE VINCULACIÓN GENERADO')}
│「 📎 」${chalk.whiteBright('Ingresa este código')}
│「 🔐 」${chalk.bold.red(codeBot)}
╰─────────────────────────────◉\n`);
}, 3000)
}}}
}

conn.isInit = false;
conn.well = false;

if (!opts['test']) {
if (global.db) setInterval(async () => {
if (global.db.data) await global.db.write()
if (opts['autocleartmp'] && (global.support || {}).find) {
  const tmp = [os.tmpdir(), 'tmp'];
  tmp.forEach((filename) => {
    try {
      spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']);
    } catch (e) {
      console.log('Error al limpiar archivos temporales:', e.message);
    }
  });
}
}, 30 * 1000);
}

async function connectionUpdate(update) {
const {connection, lastDisconnect, isNewLogin} = update;
global.stopped = connection;
if (isNewLogin) conn.isInit = true;
const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
await global.reloadHandler(true).catch(console.error);
global.timestamp.connect = new Date;
}
if (global.db.data == null) loadDatabase();
if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
if (opcion == '1' || methodCodeQR) {
console.log(chalk.bold.yellow(`\n❐ ESCANEA EL CÓDIGO QR EXPIRA EN 45 SEGUNDOS`))}
}
if (connection == 'open') {
console.log(chalk.bold.green('\n✨️ Keloke ya esta conectado ✨️'))
}
let reason = new Boom(lastDisconnect?.error)?.output?.statusCode
if (connection === 'close') {
if (reason === 429) {
console.log(chalk.bold.redBright(`\n⚠︎ LÍMITE DE TASA EXCEDIDO, ESPERANDO 30 SEGUNDOS ANTES DE RECONECTAR...`))
await new Promise(resolve => setTimeout(resolve, 30000))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.badSession) {
console.log(chalk.bold.cyanBright(`\n⚠︎ SIN CONEXIÓN, BORRE LA CARPETA ${global.sessions} Y ESCANEA EL CÓDIGO QR ⚠︎`))
} else if (reason === DisconnectReason.connectionClosed) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☹\n┆ ⚠︎ CONEXION CERRADA, RECONECTANDO....\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☹`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionLost) {
console.log(chalk.bold.blueBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☂\n┆ ⚠︎ CONEXIÓN PERDIDA CON EL SERVIDOR, RECONECTANDO....\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ☂`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.connectionReplaced) {
console.log(chalk.bold.yellowBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✗\n┆ ⚠︎ CONEXIÓN REEMPLAZADA, SE HA ABIERTO OTRA NUEVA SESION, POR FAVOR, CIERRA LA SESIÓN ACTUAL PRIMERO.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✗`))
} else if (reason === DisconnectReason.loggedOut) {
console.log(chalk.bold.redBright(`\n⚠︎ SIN CONEXIÓN, BORRE LA CARPETA ${global.sessions} Y ESCANEA EL CÓDIGO QR ⚠︎`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.restartRequired) {
console.log(chalk.bold.cyanBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✓\n┆ ✧ CONECTANDO AL SERVIDOR...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ✓`))
await global.reloadHandler(true).catch(console.error)
} else if (reason === DisconnectReason.timedOut) {
console.log(chalk.bold.yellowBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ▸\n┆ ⧖ TIEMPO DE CONEXIÓN AGOTADO, RECONECTANDO....\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ▸`))
await global.reloadHandler(true).catch(console.error)
} else {
console.log(chalk.bold.redBright(`\n⚠︎！ RAZON DE DESCONEXIÓN DESCONOCIDA: ${reason || 'No encontrado'} >> ${connection || 'No encontrado'}`))
}}
}
process.on('uncaughtException', console.error)
let isInit = true;
let handler = await import('./handler.js')
global.reloadHandler = async function(restatConn) {
try {
const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error(e);
}
if (restatConn) {
const oldChats = global.conn.chats
try {
global.conn.ws.close()
} catch { }
conn.ev.removeAllListeners()
global.conn = makeWASocket(connectionOptions, {
  chats: oldChats,
  retryRequestDelayMs: 10000,
  maxRetries: 3
})
isInit = true
}
if (!isInit) {
conn.ev.off('messages.upsert', conn.handler)
conn.ev.off('connection.update', conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
}

conn.handler = handler.handler ? handler.handler.bind(conn) : conn.handler
conn.connectionUpdate = connectionUpdate.bind(global.conn)
conn.credsUpdate = saveCreds.bind(global.conn, true)

const currentDateTime = new Date()
const messageDateTime = new Date(conn.ev)
if (currentDateTime >= messageDateTime) {
const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
} else {
const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0])
}

// Manejar eventos de mensajes
conn.ev.on('messages.upsert', async (m) => {
    if (m.messages && m.messages[0] && m.messages[0].key && m.messages[0].key.remoteJid) {
        const jid = m.messages[0].key.remoteJid;
        await conn.sendPresenceUpdate('composing', jid);
        await conn.handler(m);
        await conn.readMessages([m.messages[0].key]);
        await conn.sendPresenceUpdate('paused', jid);
    }
});

conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
return true
};

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
try {
const file = global.__filename(join(pluginFolder, filename))
const module = await import(file)
global.plugins[filename] = module.default || module
} catch (e) {
conn.logger.error(e)
delete global.plugins[filename]
}}}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);

global.reload = async (_ev, filename) => {
if (pluginFilter(filename)) {
const dir = global.__filename(join(pluginFolder, filename), true);
if (filename in global.plugins) {
if (existsSync(dir)) conn.logger.info(` updated plugin - '${filename}'`)
else {
conn.logger.warn(`deleted plugin - '${filename}'`)
return delete global.plugins[filename]
}} else conn.logger.info(`new plugin - '${filename}'`);
const err = syntaxerror(readFileSync(dir), filename, {
sourceType: 'module',
allowAwaitOutsideFunction: true,
});
if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`)
else {
try {
const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
global.plugins[filename] = module.default || module;
} catch (e) {
conn.logger.error(`error require plugin '${filename}\n${format(e)}'`)
} finally {
global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)))
}}
}}
Object.freeze(global.reload)
watch(pluginFolder, global.reload)
await global.reloadHandler()

async function _quickTest() {
const test = await Promise.all([
spawn('ffmpeg'),
spawn('ffprobe'),
spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
spawn('convert'),
spawn('magick'),
spawn('gm'),
spawn('find', ['--version']),
].map((p) => {
return Promise.race([
new Promise((resolve) => {
p.on('close', (code) => {
resolve(code !== 127);
});
}),
new Promise((resolve) => {
p.on('error', (_) => resolve(false));
})]);
}));
const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
const s = global.support = {ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find};
Object.freeze(global.support);
}

function clearTmp() {
const tmpDir = join(__dirname, 'tmp')
if (existsSync(tmpDir)) {
const filenames = readdirSync(tmpDir)
filenames.forEach(file => {
try {
const filePath = join(tmpDir, file)
if (existsSync(filePath)) unlinkSync(filePath)
} catch (e) {
console.log('Error al limpiar archivo temporal:', e.message)
}
})
}}

function purgeSession() {
let prekey = []
const sessionDir = `./${global.sessions}`
if (existsSync(sessionDir)) {
let directorio = readdirSync(sessionDir)
let filesFolderPreKeys = directorio.filter(file => {
return file.startsWith('pre-key-')
})
prekey = [...prekey, ...filesFolderPreKeys]
filesFolderPreKeys.forEach(files => {
try {
unlinkSync(`${sessionDir}/${files}`)
} catch (e) {
console.log('Error al eliminar archivo de sesión:', e.message)
}
})
}}
function purgeOldFiles() {
const directories = [`./${global.sessions}/`]
directories.forEach(dir => {
if (existsSync(dir)) {
try {
const files = readdirSync(dir)
files.forEach(file => {
if (file !== 'creds.json') {
const filePath = path.join(dir, file);
try {
unlinkSync(filePath)
console.log(chalk.bold.green(`\n╭» ❍ ARCHIVO ❍\n│→ ${file} BORRADO CON ÉXITO\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
} catch (err) {
console.log(chalk.bold.red(`\n╭» ❍ ARCHIVO ❍\n│→ ${file} NO SE LOGRÓ BORRAR\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ✘`))
}
}
})
} catch (e) {
console.log('Error al acceder al directorio:', e.message)
}
}})
}

function redefineConsoleMethod(methodName, filterStrings) {
const originalConsoleMethod = console[methodName]
console[methodName] = function() {
const message = arguments[0]
if (typeof message === 'string' && filterStrings.some(filterString => message.includes(atob(filterString)))) {
arguments[0] = ""
}
originalConsoleMethod.apply(console, arguments)
}}

setInterval(async () => {
if (global.stopped === 'close' || !conn || !conn.user) return
await clearTmp()
console.log(chalk.bold.cyanBright(`\n╭» ❍ MULTIMEDIA ❍\n│→ ARCHIVOS DE LA CARPETA TMP ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
}, 1000 * 60 * 4) // 4 minutos

setInterval(async () => {
if (global.stopped === 'close' || !conn || !conn.user) return
await purgeSession()
console.log(chalk.bold.cyanBright(`\n╭» ❍ ${global.sessions} ❍\n│→ SESIONES NO ESENCIALES ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
}, 1000 * 60 * 10) // 10 minutos

setInterval(async () => {
if (global.stopped === 'close' || !conn || !conn.user) return
await purgeOldFiles()
console.log(chalk.bold.cyanBright(`\n╭» ❍ ARCHIVOS ❍\n│→ ARCHIVOS RESIDUALES ELIMINADAS\n╰― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ― ⌫ ♻`))
}, 1000 * 60 * 10) // 10 minutos

// Ejecutar test inicial y mostrar mensaje final
_quickTest()
  .then(() => {
    conn.logger.info(chalk.bold(`✦  H E C H O\n`.trim()))
    console.log(chalk.bold.greenBright('\n🚀 Bot iniciado correctamente. Listo para recibir mensajes.'))
  })
  .catch(console.error)

// Función para validar números de teléfono
async function isValidPhoneNumber(number) {
  try {
    number = number.replace(/\s+/g, '')
    if (number.startsWith('+521')) {
      number = number.replace('+521', '+52');
    } else if (number.startsWith('+52') && number[4] === '1') {
      number = number.replace('+52 1', '+52');
    }
    const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
    return phoneUtil.isValidNumber(parsedNumber)
  } catch (error) {
    return false
  }
}

// Manejo de cierre del proceso
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n⚠️  Cerrando bot...'))
  
  if (global.conn) {
    try {
      await global.conn.ws.close()
    } catch (e) {
      console.error('Error al cerrar conexión:', e)
    }
  }
  
  if (global.db && global.db.data) {
    try {
      await global.db.write()
      console.log(chalk.green('✅ Base de datos guardada'))
    } catch (e) {
      console.error('Error al guardar base de datos:', e)
    }
  }
  
  console.log(chalk.red('❌ Bot desconectado'))
  process.exit(0)
})

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Mensaje final de inicio
console.log(chalk.bold.magentaBright(`
╭─────────────────────────────────────╮
│  🤖 KelokeBot iniciado correctamente │
│  ✨ Listo para recibir mensajes      │
│  📱 Versión limpia sin jadibots      │
╰─────────────────────────────────────╯
`))

