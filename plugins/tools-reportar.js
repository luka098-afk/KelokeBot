let handler = async (m, { conn, participants, text }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  const admins = participants.filter(p => p.admin).map(p => p.id)
  if (admins.length === 0) return m.reply('❌ No se encontraron administradores en este grupo.')

  // Si hay un mensaje citado, usar "Reporte" en lugar del contenido
  let mensajeReportado
  if (m.quoted) {
    mensajeReportado = text || 'Reporte'
  } else {
    mensajeReportado = text || 'Sin detalles.'
  }

  const usuario = `@${m.sender.split('@')[0]}`

  // Crear menciones para todos los admins usando formato JIDs
  const adminMentions = admins.map(admin => `@${admin.split('@')[0]}`).join(' ')
  const menciones = admins.concat([m.sender])

  let aviso = `🚨 *¡NUEVO REPORTE RECIBIDO!*\n\n`
  aviso += `📌 *Usuario que reporta:* ${usuario}\n\n`
  aviso += `📝 *Contenido del reporte:*\n${mensajeReportado}\n\n`
  aviso += `👮‍♂️ *Llamando a todos los administradores:*\n${adminMentions}\n\n`
  aviso += `⚠️ *Admins, por favor revisar este reporte inmediatamente.*`

  await conn.sendMessage(m.chat, {
    text: aviso,
    mentions: menciones
  }, { quoted: m })
}

handler.help = ['reportar <texto>']
handler.tags = ['grupo']
handler.command = /^reportar$/i
handler.group = true
handler.admin = false

export default handler
