import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {

// Definir variables que podrían no estar definidas
let fake = {
  contextInfo: {
    mentionedJid: [m.sender],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363386229166956@newsletter',
      newsletterName: '🎃holaaaaaa🎃',
      serverMessageId: 143
    }
  }
}

// Definir variables globales si no existen
let redes = global.redes || ''
let icons = global.icons || null
let packname = global.packname || '🎃Keloke Stickers'
let rcanal = global.rcanal || fake

let stiker = false
try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || q.mediaType || ''
if (/webp|image|video/g.test(mime)) {
if (/video/g.test(mime)) if ((q.msg || q).seconds > 8) return m.reply(`🎃 *¡El video no puede durar mas de 8 segundos!*`)

// Verificar si el archivo existe antes de procesarlo
let img
try {
  img = await q.download?.()
} catch (downloadError) {
  console.error('Download error:', downloadError)
  return m.reply('🎃 Error al descargar el archivo. Intenta de nuevo.')
}

if (!img || !Buffer.isBuffer(img)) return conn.reply(m.chat, `🎃 𝙋𝙤𝙧 𝙁𝙖𝙫𝙤𝙧, 𝙚𝙣𝙫𝙞𝙖 𝙪𝙣𝙖 𝙞𝙢𝙖𝙜𝙚𝙣 𝙤 𝙫𝙞𝙙𝙚𝙤 𝙫á𝙡𝙞𝙙𝙤 𝙥𝙖𝙧𝙖 𝙝𝙖𝙘𝙚𝙧 𝙪𝙣 𝙨𝙩𝙞𝙘𝙠𝙚𝙧 🦇`, m, rcanal)

// Intentar crear el sticker directamente primero
try {
stiker = await sticker(img, false, global.packsticker || packname, global.packsticker2 || '🎃 Halloween Bot')
} catch (e) {
console.error('Direct sticker creation failed:', e)
// Si falla, intentar métodos alternativos
let out
try {
if (/webp/g.test(mime)) {
  out = await webp2png(img)
} else if (/image/g.test(mime)) {
  out = await uploadImage(img)
} else if (/video/g.test(mime)) {
  out = await uploadFile(img)
}

if (out && typeof out === 'string') {
  stiker = await sticker(false, out, global.packsticker || packname, global.author || '🎃 Halloween Bot')
} else {
  // Último intento con uploadImage
  out = await uploadImage(img)
  stiker = await sticker(false, out, global.packsticker || packname, global.author || '🎃 Halloween Bot')
}
} catch (err) {
console.error('Alternative processing failed:', err)
return m.reply('🎃 Error al procesar el archivo. El formato podría no ser compatible.')
}
}
} else if (args[0]) {
if (isUrl(args[0])) {
try {
stiker = await sticker(false, args[0], global.packsticker || packname, global.packsticker2 || '🎃 Halloween Bot')
} catch (err) {
console.error('Error with URL sticker:', err)
return m.reply('🎃 Error al procesar la URL. Verifica que sea una imagen válida.')
}
} else return m.reply(`⚠️ El url es incorrecto`)
}
} catch (e) {
console.error(e)
if (!stiker) stiker = e
} finally {
if (stiker) conn.sendFile(m.chat, stiker, 'sticker.webp', '',m, true, { 
  contextInfo: { 
    'forwardingScore': 200, 
    'isForwarded': false, 
    externalAdReply: { 
      showAdAttribution: false, 
      title: packname, 
      body: `🎃 Keloke 👻`, 
      mediaType: 2, 
      sourceUrl: redes, 
      thumbnail: icons
    }
  }
}, { quoted: m })

else return conn.reply(m.chat, `╭━〔 🎃 𝗦𝗽𝗼𝗼𝗸𝘆 𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗧𝗶𝗺𝗲! 👻 〕━⬣
┃
┃ 🦇 🔖 𝑯𝒐𝒍𝒂, 𝒏𝒆𝒄𝒆𝒔𝒊𝒕𝒐 𝒖𝒏𝒂 𝒊𝒎𝒂𝒈𝒆𝒏 𝒐 𝒗𝒊𝒅𝒆𝒐 
┃ 🕷️ 𝒑𝒂𝒓𝒂 𝒄𝒓𝒆𝒂𝒓 𝒕𝒖 𝒔𝒕𝒊𝒄𝒌𝒆𝒓 𝒆𝒔𝒑𝒆𝒍𝒖𝒛𝒏𝒂𝒏𝒕𝒆 🎨
┃
╰━━━━━━━━━━━━━━━━━━⬣`, m, fake)


}}
handler.help = ['stiker <img>', 'sticker <url>']
handler.tags = ['sticker']
handler.group = false;
handler.register = true
handler.command = ['s', 'sticker', 'stiker']

export default handler

const isUrl = (text) => {
return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))}
