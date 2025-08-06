const handler = async (m, { conn, text, usedPrefix, command, participants, groupMetadata, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('✦ Este comando solo se puede usar en grupos.')
  if (!isAdmin) return m.reply('✦ Solo los administradores pueden usar este comando.')
  if (!isBotAdmin) return m.reply('✦ Necesito ser administrador para poder eliminar usuarios.')

  const user = m.mentionedJid?.[0]
  const mensaje = text.split(" ").slice(1).join(" ")

  if (!user) return m.reply(`✦ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}${command} @usuario razón*`)
  if (!mensaje) return m.reply('✦ Debes escribir el motivo de la advertencia.')

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
      // Enviar mensaje de eliminación al grupo
      await conn.sendMessage(m.chat, { 
        text: eliminarTexto,
        mentions: [user]
      }, { quoted: m })

      // Eliminar usuario del grupo
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      
      // Resetear las advertencias del usuario
      delete global.db.data.chats[m.chat].warns[user]

    } catch (e) {
      console.error(e)
      await m.reply('❌ No se pudo eliminar al usuario. Verifica que el bot tenga permisos de administrador.')
    }
  } else {
    // Advertencia normal (1ra o 2da)
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
      // Enviar advertencia al grupo mencionando al usuario
      await conn.sendMessage(m.chat, { 
        text: advertenciaTexto,
        mentions: [user]
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply('❌ No se pudo enviar la advertencia.')
    }
  }
}

handler.command = ['advertencia', 'ad', 'daradvertencia', 'advertir', 'warn']
handler.tags = ['grupo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
