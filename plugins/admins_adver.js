const handler = async (m, { conn, text, usedPrefix, command, participants, groupMetadata, isAdmin, isBotAdmin }) => {
  const channelRD = global.channelRD || { id: '120363386229166956@newsletter', name: 'Canal Oficial' }

  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: '✦ Este comando solo se puede usar en grupos.',
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

  if (!isAdmin) return conn.sendMessage(m.chat, {
    text: '✦ Solo los administradores pueden usar este comando.',
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

  if (!isBotAdmin) return conn.sendMessage(m.chat, {
    text: '✦ Necesito ser administrador para poder eliminar usuarios.',
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

  const user = m.mentionedJid?.[0]
  const mensaje = text.split(" ").slice(1).join(" ")

  if (!user) return conn.sendMessage(m.chat, {
    text: `✦ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}${command} @usuario razón*`,
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

  if (!mensaje) return conn.sendMessage(m.chat, {
    text: '✦ Debes escribir el motivo de la advertencia.',
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

  const date = new Date().toLocaleDateString('es-ES')

  // Inicializar el sistema de advertencias si no existe
  if (!global.db.data.chats[m.chat].warns) {
    global.db.data.chats[m.chat].warns = {}
  }

  // Obtener advertencias actuales del usuario
  const currentWarns = global.db.data.chats[m.chat].warns[user] || { count: 0, date: null }
  const newWarnCount = currentWarns.count + 1

  // Actualizar el contador de advertencias con fecha
  global.db.data.chats[m.chat].warns[user] = {
    count: newWarnCount,
    date: date,
    jid: user
  }

  const groupName = groupMetadata.subject
  const senderName = await conn.getName(m.sender)
  const userName = await conn.getName(user)

  // Verificar si es la tercera advertencia
  if (newWarnCount >= 3) {
    const eliminarTexto = `🚫 *USUARIO ELIMINADO* 🚫

👤 *Usuario:* @${user.split('@')[0]}
👮‍♂️ *Moderador:* ${senderName}
📅 *Fecha:* ${date}
⚠️ *Advertencias:* ${newWarnCount}/3

📝 *Última razón:*
${mensaje}

❌ *El usuario ha sido eliminado del grupo por acumular 3 advertencias.*`

    try {
      await conn.sendMessage(m.chat, {
        text: eliminarTexto,
        mentions: [user],
        contextInfo: {
          mentionedJid: [user, m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            serverMessageId: 100,
            newsletterName: channelRD.name
          }
        }
      }, { quoted: m })

      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      delete global.db.data.chats[m.chat].warns[user]

    } catch (e) {
      console.error(e)
      await conn.sendMessage(m.chat, {
        text: '❌ No se pudo eliminar al usuario. Verifica que el bot tenga permisos de administrador.',
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

  } else {
    const advertenciaTexto = `⚠️ *ADVERTENCIA ${newWarnCount}/3* ⚠️

👤 *Usuario:* @${user.split('@')[0]}
👮‍♂️ *Moderador:* ${senderName}
📅 *Fecha:* ${date}

📝 *Motivo:*
${mensaje}

${newWarnCount === 2 ?
  '🔥 *¡ÚLTIMA ADVERTENCIA!* La próxima advertencia resultará en eliminación del grupo.' :
  '❗ Por favor, evita futuras faltas. Te quedan ' + (3 - newWarnCount) + ' advertencias.'}`

    try {
      await conn.sendMessage(m.chat, {
        text: advertenciaTexto,
        mentions: [user],
        contextInfo: {
          mentionedJid: [user, m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelRD.id,
            serverMessageId: 100,
            newsletterName: channelRD.name
          }
        }
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await conn.sendMessage(m.chat, {
        text: '❌ No se pudo enviar la advertencia.',
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
  }
}

handler.command = ['advertencia', 'ad', 'daradvertencia', 'advertir', 'warn']
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler
