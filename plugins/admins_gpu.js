import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command, isAdmin }) => {
  const channelRD = global.channelRD || { id: '120363386229166956@newsletter', name: 'Canal Oficial' }

  // Helper para enviar mensajes con canal
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

  // Verificar si el usuario es admin
  if (m.isGroup && !isAdmin) {
    return sendWithChannel('🔒 *Solo administradores pueden usar este comando*')
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } })

    let targetUser = null
    let userName = 'Usuario'

    // Determinar el usuario objetivo
    if (m.quoted) {
      targetUser = m.quoted.sender
      userName = m.quoted.pushName || targetUser.split('@')[0] || 'Usuario'
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      targetUser = m.mentionedJid[0]
      userName = targetUser.split('@')[0] || 'Usuario'
    } else {
      targetUser = m.sender
      userName = m.pushName || targetUser.split('@')[0] || 'Usuario'
    }

    // Intentar obtener la foto de perfil
    let profileBuffer = null
    try {
      const profilePicUrl = await conn.profilePictureUrl(targetUser, 'image')
      if (profilePicUrl) {
        const response = await fetch(profilePicUrl)
        if (response.ok) profileBuffer = await response.buffer()
      }
    } catch {
      try {
        const profilePicUrl = await conn.profilePictureUrl(targetUser, 'preview')
        if (profilePicUrl) {
          const response = await fetch(profilePicUrl)
          if (response.ok) profileBuffer = await response.buffer()
        }
      } catch {}
    }

    if (profileBuffer && profileBuffer.length > 0) {
      // Enviar solo la foto
      await conn.sendMessage(m.chat, { image: profileBuffer }, { quoted: m })
    } else {
      await sendWithChannel(`❌ *${userName}* no tiene foto visible para todos`, [targetUser])
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (error) {
    console.error('❌ Error en gpu:', error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await sendWithChannel(`❌ *Error al obtener foto de perfil*`)
  }
}

handler.command = ['gpu']
handler.tags = ['tools']
handler.help = ['gpu']
handler.register = true

export default handler
