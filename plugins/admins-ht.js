import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import * as fs from 'fs'

var handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {
  const channelRD = global.channelRD || { id: '120363386229166956@newsletter', name: 'Canal Oficial' }

  // 🔹 Mensaje de error también con botón de canal
  if (!m.quoted && !text) {
    return conn.sendMessage(m.chat, {
      text: `🚫 Debes enviar un texto o citar un mensaje para hacer un tag.`,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: channelRD.name
        }
      }
    }, { quoted: m })
  }

  try {
    let users = participants.map(u => conn.decodeJid(u.id))
    let q = m.quoted ? m.quoted : m
    let c = m.quoted ? await m.getQuotedObj() : m
    let msg = conn.cMod(m.chat, generateWAMessageFromContent(m.chat, {
      [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: text || c.text }
    }, { quoted: null, userJid: conn.user.id }), text || q.text, conn.user.jid, { mentions: users })

    // 🔹 Agregamos el canal al mensaje modificado
    msg.message[m.quoted ? q.mtype : 'extendedTextMessage'].contextInfo = {
      mentionedJid: users,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        serverMessageId: 100,
        newsletterName: channelRD.name
      }
    }

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
      conn.sendMessage(m.chat, { 
        image: mediax, 
        mentions: users, 
        caption: htextos, 
        contextInfo: {
          mentionedJid: users,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            serverMessageId: 100,
            newsletterName: channelRD.name
          }
        }
      }, { quoted: m })

    } else if ((isMedia && quoted.mtype === 'videoMessage') && htextos) {
      var mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { 
        video: mediax, 
        mentions: users, 
        mimetype: 'video/mp4', 
        caption: htextos,
        contextInfo: {
          mentionedJid: users,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            serverMessageId: 100,
            newsletterName: channelRD.name
          }
        }
      }, { quoted: m })

    } else if ((isMedia && quoted.mtype === 'audioMessage') && htextos) {
      var mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { 
        audio: mediax, 
        mentions: users, 
        mimetype: 'audio/mp4', 
        fileName: `Hidetag.mp3`,
        contextInfo: {
          mentionedJid: users,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            serverMessageId: 100,
            newsletterName: channelRD.name
          }
        }
      }, { quoted: m })

    } else if ((isMedia && quoted.mtype === 'stickerMessage') && htextos) {
      var mediax = await quoted.download?.()
      conn.sendMessage(m.chat, { 
        sticker: mediax, 
        mentions: users,
        contextInfo: {
          mentionedJid: users,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            serverMessageId: 100,
            newsletterName: channelRD.name
          }
        }
      }, { quoted: m })

    } else {
      await conn.relayMessage(m.chat, {
        extendedTextMessage: {
          text: `${masss}\n${htextos}\n`,
          contextInfo: {
            mentionedJid: users,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: channelRD.id,
              serverMessageId: 100,
              newsletterName: channelRD.name
            }
          }
        }
      }, {})
    }
  }
}

handler.help = ['ht']
handler.tags = ['grupo']
handler.command = ['ht']  // Solo responde a .ht
handler.group = true
handler.admin = true
handler.register = true

export default handler
