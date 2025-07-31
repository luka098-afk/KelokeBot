const handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo se puede usar en grupos.')
  if (!isAdmin) return m.reply('🛡️ Solo los administradores pueden usar este comando.')
  if (!isBotAdmin) return m.reply('🤖 Necesito ser administrador para cambiar la configuración del grupo.')

  try {
    // Obtener información actual del grupo
    const groupInfo = await conn.groupMetadata(m.chat)
    const isAnnouncement = groupInfo.announce
    
    if (isAnnouncement) {
      // El grupo está cerrado, abrirlo
      await conn.groupSettingUpdate(m.chat, 'not_announcement')
      return m.reply('🔓 *El grupo ha sido abierto.*\nAhora todos pueden enviar mensajes.')
    } else {
      // El grupo está abierto, cerrarlo
      await conn.groupSettingUpdate(m.chat, 'announcement')
      return m.reply('🔒 *El grupo ha sido cerrado.*\nSolo los administradores pueden enviar mensajes.')
    }
  } catch (error) {
    console.error('Error al obtener info del grupo:', error)
    return m.reply('❌ Error al cambiar la configuración del grupo.')
  }
}

handler.help = ['g']
handler.tags = ['grupo']
handler.command = ['g']
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler
