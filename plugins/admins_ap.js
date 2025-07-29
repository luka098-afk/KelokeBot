let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!isAdmin) return m.reply('⛔ Solo los administradores pueden usar este comando.')
  if (!isBotAdmin) return m.reply('⛔ El bot necesita ser administrador para aprobar solicitudes.')

  try {
    let solicitudes = await conn.groupRequestParticipants(m.chat)
    if (!solicitudes || solicitudes.length === 0) {
      return m.reply('📭 No hay solicitudes pendientes.')
    }

    let jids = solicitudes.map(s => s.jid)
    await conn.groupRequestParticipantsUpdate(m.chat, jids, 'approve')

    m.reply(`✅ Se aprobaron ${jids.length} solicitudes.`)

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Ocurrió un error al aprobar las solicitudes.')
  }
}

handler.command = /^in$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
