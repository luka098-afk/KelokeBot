const handler = async (m, { conn, isAdmin, isBotAdmin, args }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo se puede usar en grupos.')
  if (!isAdmin) return m.reply('🛡️ Solo los administradores pueden usar este comando.')
  if (!isBotAdmin) return m.reply('🤖 Necesito ser administrador para cambiar la configuración del grupo.')

  if (!args[0]) return m.reply('⚠️ Debes especificar "abrir" o "cerrar".\nEjemplo: .g abrir')

  const accion = args[0].toLowerCase()

  if (accion === 'abrir') {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    return m.reply('🔓 *El grupo ha sido abierto.*\nAhora todos pueden enviar mensajes.')
  } 

  if (accion === 'cerrar') {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    return m.reply('🔒 *El grupo ha sido cerrado.*\nSolo los administradores pueden enviar mensajes.')
  }

  return m.reply('⚠️ Comando no reconocido. Usa "abrir" o "cerrar".')
}

handler.help = ['g abrir', 'g cerrar']
handler.tags = ['grupo']
handler.command = ['g']
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler
