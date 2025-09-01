import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import * as fs from 'fs'

var handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {
  const channelRD = global.channelRD || { id: '120363386229166956@newsletter', name: 'Canal Oficial' }

  // Función auxiliar para enviar mensajes con canal
  const sendWithChannel = async (msgText, mentions = [m.sender], quoted = m) => {
    return conn.sendMessage(m.chat, {
      text: msgText,
      mentions,
      contextInfo: {
        mentionedJid: mentions,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: channelRD.name
        }
      }
    }, { quoted })
  }

  // Validar si hay texto o mensaje citado
  if (!m.quoted && !text) {
    return sendWithChannel('🚫 Debes enviar un texto o citar un mensaje para hacer un tag.')
  }

  // Función para enviar hidetag con canal
  const sendHideTag = async () => {
    try {
      let users = participants.map(u => conn.decodeJid(u.id))
      let q = m.quoted ? m.quoted : m
      let c = m.quoted ? await m.getQuotedObj() : m

      let msg = conn.cMod(
        m.chat,
        generateWAMessageFromContent(
          m.chat,
          {
            [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted
              ? c.message[q.mtype]
              : { text: text || c.text }
          },
          { quoted: null, userJid: conn.user.id }
        ),
        text || q.text,
        conn.user.jid,
        { mentions: users }
      )

      // Agregar canal a todos los mensajes modificados
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

      const sendMediaWithChannel = async (type, media, extra = {}) => {
        await conn.sendMessage(m.chat, {
          [type]: media,
          mentions: users,
          caption: htextos,
          ...extra,
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
      }

      if ((isMedia && quoted.mtype === 'imageMessage') && htextos) {
        var mediax = await quoted.download?.()
        await sendMediaWithChannel('image', mediax)

      } else if ((isMedia && quoted.mtype === 'videoMessage') && htextos) {
        var mediax = await quoted.download?.()
        await sendMediaWithChannel('video', mediax, { mimetype: 'video/mp4' })

      } else if ((isMedia && quoted.mtype === 'audioMessage') && htextos) {
        var mediax = await quoted.download?.()
        await sendMediaWithChannel('audio', mediax, { mimetype: 'audio/mp4', fileName: 'Hidetag.mp3' })

      } else if ((isMedia && quoted.mtype === 'stickerMessage') && htextos) {
        var mediax = await quoted.download?.()
        await sendMediaWithChannel('sticker', mediax)

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

  // Enviar reacción inicial
  await conn.sendMessage(m.chat, { react: { text: '📢', key: m.key } })

  // Enviar hidetag 5 veces
  for (let i = 1; i <= 5; i++) {
    await sendHideTag()
  }

  // Enviar reacción final
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
}

handler.help = ['ht2']
handler.tags = ['grupo']
handler.command = ['ht2']
handler.group = true
handler.admin = true
handler.register = true

export default handler
