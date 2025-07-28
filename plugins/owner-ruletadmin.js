// Lista de números dueños sin el símbolo "+"
const ownerNumbers = ['59896026646', '59898719147']

let handler = async (m, { conn, participants, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')

  // Obtener el número sin "@s.whatsapp.net"
  const senderID = m.sender.split('@')[0]

  // Verificar si el que envía es dueño
  if (!ownerNumbers.includes(senderID)) {
    return m.reply('⛔ Este comando solo puede usarlo un *dueño del bot*.')
  }

  // Verificar que el bot sea admin
  if (!isBotAdmin) {
    return m.reply('❌ No puedo ejecutar este comando porque no soy administrador.')
  }

  // Filtrar admins que no sean bot ni dueños
  let admins = participants.filter(p =>
    p.admin &&
    !ownerNumbers.includes(p.id.split('@')[0]) &&
    p.id !== conn.user.jid
  )

  if (admins.length === 0) {
    return m.reply('😅 No hay administradores elegibles para degradar.')
  }

  // Elegir admin al azar para degradar
  let degradado = admins[Math.floor(Math.random() * admins.length)]

  // Mensaje previo
  await conn.sendMessage(m.chat, {
    text: `🎲 *RULETADMIN - INACTIVIDAD* 🎲\nAnalizando actividad de los administradores...`,
  })

  await new Promise(r => setTimeout(r, 2000))

  await conn.sendMessage(m.chat, {
    text: `🛑 @${degradado.id.split('@')[0]} ha sido marcado como *inactivo* y perderá sus privilegios de administrador.`,
    mentions: [degradado.id]
  })

  // Quitar admin
  await conn.groupParticipantsUpdate(m.chat, [degradado.id], 'demote')
}

handler.command = /^ruletadmin$/i
handler.group = true

export default handler
