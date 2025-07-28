const ownerNumbers = ['59898719147'],['59896026646'] // Tu número sin '+'

let handler = async (m, { conn, participants, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')

  const senderID = m.sender.split('@')[0]
  const senderJid = m.sender

  if (!ownerNumbers.includes(senderID)) {
    return m.reply('⛔ Este comando solo puede usarlo el dueño del bot.')
  }

  if (!isBotAdmin) return m.reply('⚠️ El bot debe ser administrador para degradar a alguien.')

  // Filtrar admins que no sean el bot ni los dueños
  let admins = participants.filter(p =>
    p.admin &&
    !ownerNumbers.includes(p.id.split('@')[0]) &&
    p.id !== conn.user.jid
  )

  if (admins.length === 0) return m.reply('😅 No hay administradores elegibles para degradar.')

  // Elegir uno al azar
  let degradado = admins[Math.floor(Math.random() * admins.length)]

  // Mensaje dramático
  await conn.sendMessage(m.chat, {
    text: `🎲 *RULETADMIN - INACTIVO DETECTADO* 🎲\n\n⏳ Analizando actividad...`,
  })
  await new Promise(r => setTimeout(r, 2000))

  await conn.sendMessage(m.chat, {
    text: `⚖️ @${degradado.id.split('@')[0]} ha sido declarado *inactivo* y será *removido del poder* 😔\n\n👋 Gracias por tus servicios.`,
    mentions: [degradado.id]
  })

  // Quitar admin
  await conn.groupParticipantsUpdate(m.chat, [degradado.id], 'demote')
}
handler.command = /^ruletadmin$/i
handler.group = true

export default handler
