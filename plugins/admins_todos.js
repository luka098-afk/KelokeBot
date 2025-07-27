const handler = async (m, { conn, args, participants, isAdmin }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo se puede usar en grupos.')
  if (!isAdmin) return m.reply('🛡️ Solo los administradores pueden usar este comando.')

  const mensaje = args.length > 0 ? args.join(' ') : 'HOLAAAAA'
  const menciones = participants.map(p => p.id)
  const textoMencion = menciones.map(u => '@' + u.split('@')[0]).join(' ')

  await conn.sendMessage(m.chat, { text: `${mensaje}\n\n${textoMencion}`, mentions: menciones }, { quoted: m })
}

handler.help = ['tagall [texto]']
handler.tags = ['grupo']
handler.command = ['tagall']
handler.group = true

export default handler
