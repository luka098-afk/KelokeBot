import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import * as fs from 'fs'

var handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {

if (!m.quoted && !text) return conn.reply(m.chat, `🚫 Debes enviar un texto o citar un mensaje para hacer un tag.`, m)

// Función para enviar hidetag
const sendHideTag = async () => {
  try {
    let users = participants.map(u => conn.decodeJid(u.id))
    let q = m.quoted ? m.quoted : m
    let c = m.quoted ? await m.getQuotedObj() : m
    let msg = conn.cMod(m.chat, generateWAMessageFromContent(m.chat, {
      [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: text || c.text }
    }, { quoted: null, userJid: conn.user.id }), text || q.text, conn.user.jid, { mentions: users })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch {
    let users = participants.map(u => conn.decodeJid(u.id))
    let quoted = m.quoted ? m.quoted : m
    let mime = (quoted.msg || quoted).mimetype || ''
    let isMedia = /image|video|sticker|audio/.test(mime)
    let more = String.fromCharCode(8206)
    let masss = more.repeat(850)
    let htextos = `${text ? text : "*Hola!!*"}`

    if ((isMedia && quoted.mtype === 'imageMessage') && htextos) {
      var mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { image: mediax, mentions: users, caption: htextos }, { quoted: null })
    } else if ((isMedia && quoted.mtype === 'videoMessage') && htextos) {
      var mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { video: mediax, mentions: users, mimetype: 'video/mp4', caption: htextos }, { quoted: null })
    } else if ((isMedia && quoted.mtype === 'audioMessage') && htextos) {
      var mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { audio: mediax, mentions: users, mimetype: 'audio/mp4', fileName: `Hidetag.mp3` }, { quoted: null })
    } else if ((isMedia && quoted.mtype === 'stickerMessage') && htextos) {
      var mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { sticker: mediax, mentions: users }, { quoted: null })
    } else {
      await conn.relayMessage(m.chat, {
        extendedTextMessage: {
          text: `${masss}\n${htextos}\n`,
          contextInfo: {
            mentionedJid: users,
            externalAdReply: {
              thumbnail: null,
              sourceUrl: ''
            }
          }
        }
      }, {})
    }
  }
}

// Enviar 5 veces rápido
await conn.sendMessage(m.chat, { react: { text: '📢', key: m.key } });

for (let i = 1; i <= 5; i++) {
  await sendHideTag();
}

await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

}

handler.help = ['ht2']
handler.tags = ['grupo']
handler.command = ['ht2']  
handler.group = true
handler.admin = true
handler.register = true

export default handler
