const handler = async (m, { conn, text, usedPrefix, command, groupMetadata, isAdmin }) => {
  if (!m.isGroup) return m.reply('✦ Este comando solo se puede usar en grupos.')
  if (!isAdmin) return m.reply('✦ Solo los administradores pueden usar este comando.')

  const user = m.mentionedJid?.[0]
  
  if (!user) return m.reply(`✦ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}${command} @usuario*`)

  // Verificar si existe el sistema de advertencias
  if (!global.db.data.chats[m.chat].warns) {
    return m.reply('✦ No hay usuarios con advertencias en este grupo.')
  }

  const warns = global.db.data.chats[m.chat].warns
  
  // Verificar si el usuario tiene advertencias
  if (!warns[user] || warns[user].count <= 0) {
    return m.reply('✦ Este usuario no tiene advertencias.')
  }

  const userName = await conn.getName(user)
  const senderName = await conn.getName(m.sender)
  const groupName = groupMetadata.subject
  const date = new Date().toLocaleDateString('es-ES')
  
  const currentWarns = warns[user].count
  const newWarnCount = currentWarns - 1

  // Si las advertencias llegan a 0, eliminar completamente el registro
  if (newWarnCount <= 0) {
    delete warns[user]
    
    const removerTexto = `✅ *ADVERTENCIAS REMOVIDAS* ✅

👤 *Usuario:* @${user.split('@')[0]}
👮‍♂️ *Moderador:* ${senderName}
📅 *Fecha:* ${date}
🔰 *Grupo:* ${groupName}

⚠️ *Advertencias anteriores:* ${currentWarns}/3
🎉 *Advertencias actuales:* 0/3

✨ *El usuario ya no tiene advertencias y ha sido removido de la lista.*`

    try {
      await conn.sendMessage(m.chat, { 
        text: removerTexto,
        mentions: [user]
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply('❌ Error al remover las advertencias.')
    }
  } else {
    // Reducir una advertencia
    warns[user] = {
      count: newWarnCount,
      date: warns[user].date, // Mantener la fecha original
      jid: user
    }

    const reducirTexto = `⬇️ *ADVERTENCIA REMOVIDA* ⬇️

👤 *Usuario:* @${user.split('@')[0]}
👮‍♂️ *Moderador:* ${senderName}
📅 *Fecha:* ${date}
🔰 *Grupo:* ${groupName}

⚠️ *Advertencias anteriores:* ${currentWarns}/3
📉 *Advertencias actuales:* ${newWarnCount}/3

💡 *Se ha removido una advertencia al usuario.*`

    try {
      await conn.sendMessage(m.chat, { 
        text: reducirTexto,
        mentions: [user]
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply('❌ Error al remover la advertencia.')
    }
  }
}

handler.command = ['unwarn', 'quitaradvertencia', 'removeradvertencia', 'remwarn']
handler.tags = ['grupo']
handler.group = true
handler.admin = true

export default handler
