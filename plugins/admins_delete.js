let handler = async (m, { conn, usedPrefix, command }) => {
  const channelRD = global.channelRD || { id: '120363386229166956@newsletter', name: 'Canal Oficial' }

  // Helper para enviar mensajes con el canal
  const sendWithChannel = async (text, mentions = []) => {
    await conn.sendMessage(m.chat, {
      text,
      mentions: mentions.length ? mentions : [m.sender],
      contextInfo: {
        mentionedJid: mentions.length ? mentions : [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: channelRD.name
        }
      }
    }, { quoted: m })
  }

  if (!m.quoted) return sendWithChannel(`⚠️ Por favor, cita el mensaje que deseas eliminar.`)

  try {
    let delet = m.message.extendedTextMessage.contextInfo.participant
    let bang = m.message.extendedTextMessage.contextInfo.stanzaId

    await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } })
  } catch {
    try {
      await conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
    } catch (e) {
      console.error(e)
      await sendWithChannel(`❌ No se pudo eliminar el mensaje.`, [m.sender])
    }
  }
}

handler.help = ['delete']
handler.tags = ['grupo']
handler.command = ['del', 'delete']
handler.group = false
handler.admin = true
handler.botAdmin = false

export default handler
