const ownerNumbers = ['59898719147'] // Reemplazá con los números del dueño sin "+"

let handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')
  if (!isBotAdmin) return m.reply('❌ El bot necesita ser administrador para usar este comando.')

  // Verifica si quien lo usa es admin o dueño
  const senderID = m.sender.split('@')[0]
  if (!isAdmin && !ownerNumbers.includes(senderID)) {
    return m.reply('⛔ Este comando solo puede usarlo un administrador o el dueño del bot.')
  }

  // Filtrar solo usuarios normales (no admins, ni bot, ni dueños)
  let kickables = participants.filter(p =>
    !p.admin &&                            // no admin
    !ownerNumbers.includes(p.id.split('@')[0]) && // no dueño
    p.id !== conn.user.jid               // no el bot
  )

  if (kickables.length === 0) return m.reply('😅 No hay miembros normales disponibles para expulsar.')

  // Elegir uno al azar
  let elegido = kickables[Math.floor(Math.random() * kickables.length)]

  await conn.sendMessage(m.chat, {
    text: `🎯 *Ruleta Ban Activada...*\n💣 ¡El elegido al azar fue @${elegido.id.split('@')[0]}!\n\n👋 ¡Hasta la próxima!`,
    mentions: [elegido.id]
  })

  await new Promise(resolve => setTimeout(resolve, 3000)) // espera 3 segundos

  await conn.groupParticipantsUpdate(m.chat, [elegido.id], 'remove') // expulsar
}
handler.command = /^ruletaban$/i
handler.group = true
handler.admin = false

export default handler
