let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!isAdmin) return m.reply('⛔ Solo los administradores pueden usar este comando.')
  if (!isBotAdmin) return m.reply('⛔ El bot necesita ser administrador para ejecutar esta acción.')

  try {
    // Aquí no hay forma directa de obtener las solicitudes en Baileys
    m.reply('⚠️ Esta función no está soportada actualmente. El bot no puede aprobar solicitudes automáticamente.')
  } catch (e) {
    console.error(e)
    m.reply('⚠️ Ocurrió un error inesperado.')
  }
}

handler.command = /^in$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
