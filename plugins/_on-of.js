const handler = async (m, { conn, usedPrefix, command, isOwner, isAdmin }) => {
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let type = command.toLowerCase()

  // Toggle automático
  let isEnable = chat[type] || false
  isEnable = !isEnable // cambia al estado contrario automáticamente

  // Verificaciones de permisos
  switch (type) {
    case 'welcome':
    case 'reaction':
    case 'nsfw':
    case 'modoadmin':
    case 'detect':
    case 'antilink':
      if (m.isGroup && !isAdmin && !isOwner) throw false
      chat[type] = isEnable
      break
    case 'isbanned':
      if (!isOwner) throw false
      user.banned = isEnable
      break
    default:
      return conn.reply(m.chat, '⚠️ ¡Esa función no está soportada!', m)
  }

  // Mensaje final
  let estadoFinal = isEnable ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'
  let aplica = type === 'isbanned' ? `👤 Usuario ${isEnable ? 'baneado' : 'desbaneado'}` : '👥 Aplicado en este grupo'
  conn.reply(m.chat, `✅ *Configuración aplicada*\n🧩 Función: *${type}*\n🎛 Estado: ${estadoFinal}\n${aplica}`, m)
}

handler.help = ['welcome', 'reaction', 'nsfw', 'modoadmin', 'detect', 'antilink', 'isbanned']
handler.tags = ['group', 'settings']
handler.command = handler.help
handler.register = true

export default handler
