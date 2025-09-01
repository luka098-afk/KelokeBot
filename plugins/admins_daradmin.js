const promoteHandler = async (m, { conn, participants, isBotAdmin, isAdmin, args }) => {
  const channelRD = global.channelRD || { id: '120363386229166956@newsletter', name: 'Canal Oficial' }

  // Función helper para enviar mensajes con el canal
  const sendWithChannel = async (text, mentions = []) => {
    await conn.sendMessage(m.chat, {
      text,
      mentions,
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

  if (!m.isGroup) return sendWithChannel('❌ Este comando solo funciona en grupos.', [m.sender])
  if (!isAdmin) return sendWithChannel('❌ Solo los administradores pueden usar este comando.', [m.sender])
  if (!isBotAdmin) return sendWithChannel('❌ El bot necesita ser administrador para otorgar admin.', [m.sender])

  let user
  if (m.mentionedJid?.length) {
    user = m.mentionedJid[0]
  } else if (m.quoted) {
    user = m.quoted.sender
  } else if (args[0]) {
    user = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  } else {
    return sendWithChannel('❌ Menciona, responde o escribe el número del usuario al que deseas dar admin.', [m.sender])
  }

  const isParticipant = participants.some(p => p.id === user)
  if (!isParticipant) return sendWithChannel('❌ El usuario no está en este grupo.', [m.sender])

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
    await sendWithChannel(`✅ Se ha otorgado admin a @${user.split('@')[0]}`, [user])
  } catch (e) {
    console.error(e)
    await sendWithChannel('⚠️ No se pudo otorgar admin. Asegúrate de que el bot tenga permisos.', [m.sender])
  }
}

promoteHandler.command = ['p', 'promote']
promoteHandler.group = true
promoteHandler.botAdmin = false
promoteHandler.admin = true
promoteHandler.tags = ['grupo']
promoteHandler.help = ['p @usuario', 'promote @usuario']

export default promoteHandler
