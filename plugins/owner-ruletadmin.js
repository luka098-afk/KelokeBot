const ownerNumbers = ['59896026646', '59898719147'] // Dueños sin '+'

let handler = async (m, { conn, participants, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')

  const senderID = m.sender.split('@')[0]

  // Solo dueños
  if (!ownerNumbers.includes(senderID)) {
    return m.reply('⛔ Este comando solo puede usarlo un *dueño del bot*.')
  }

  if (!isBotAdmin) {
    return m.reply('❌ No puedo degradar a nadie porque *no soy administrador*.')
  }

  // Filtrar admins (excepto el bot y los dueños)
  let admins = participants.filter(p =>
    p.admin &&
    !ownerNumbers.includes(p.id.split('@')[0]) &&
    p.id !== conn.user.jid
  )

  if (admins.length === 0) {
    return m.reply('😅 No hay administradores elegibles para ser degradados.')
  }

  // Elegir uno al azar
  let degradado = admins[Math.floor(Math.random() * admins.length)]

  // Mensaje previo
  await conn.sendMessage(m.chat, {
    text: `🎲 *RULETADMIN - VERSIÓN INACTIVO* 🎲\n\nAnalizando actividad de los administradores...`,
  })

  await new Promise(res => setTimeout(res, 2000))

  await conn.sendMessage(m.chat, {
    text: `🛑 @${degradado.id.split('@')[0]} ha sido marcado como *inactivo*.\n😔 Pierde sus privilegios de administrador.`,
    mentions: [degradado.id]
  })

  // Ejecutar la degradación
  await conn.groupParticipantsUpdate(m.chat, [degradado.id], 'demote')
}

handler.command = /^ruletadmin$/i
handler.group = true

export default handler
