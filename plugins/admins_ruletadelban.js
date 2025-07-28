const ownerNumbers = ['59898719147', '59896026646'] // Agregá aquí los números del dueño SIN el "+".

let handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')
  if (!isBotAdmin) return m.reply('❌ El bot necesita ser administrador para usar este comando.')

  // Verificar si el usuario que ejecuta el comando es admin o owner
  const senderID = m.sender.split('@')[0]
  if (!isAdmin && !ownerNumbers.includes(senderID)) {
    return m.reply('⛔ Este comando solo puede usarlo un administrador o el dueño del bot.')
  }

  // Filtra a los admins (no al bot ni dueños)
  let kickables = participants.filter(p =>
    p.admin && 
    !ownerNumbers.includes(p.id.split('@')[0]) &&
    p.id !== conn.user.jid
  )

  if (kickables.length === 0) return m.reply('😅 No hay administradores disponibles para expulsar (excepto el dueño y el bot).')

  // Selección aleatoria
  let elegido = kickables[Math.floor(Math.random() * kickables.length)]

  await conn.sendMessage(m.chat, {
    text: `🎯 *Ruleta Ban Activada...*\n💣 ¡Y el admin elegido al azar es @${elegido.id.split('@')[0]}!\n\n👋 ¡Adiós, valiente!`,
    mentions: [elegido.id]
  })

  // Esperar antes de expulsar
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Expulsar al seleccionado
  await conn.groupParticipantsUpdate(m.chat, [elegido.id], 'remove')
}
handler.command = /^ruletaban$/i
handler.group = true
handler.admin = true

export default handler
