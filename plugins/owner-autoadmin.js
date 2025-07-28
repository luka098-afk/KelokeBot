const ownerNumbers = ['59898719147', '59896026646'] // Números de dueños sin '+'

let handler = async (m, { conn, participants, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')

  const senderID = m.sender.split('@')[0]
  const senderJid = m.sender

  // Verifica si quien lo ejecuta es owner
  if (!ownerNumbers.includes(senderID)) {
    return m.reply('⛔ Este comando solo puede usarlo el dueño del bot.')
  }

  // Verifica si el bot es admin
  if (!isBotAdmin) {
    return m.reply('⚠️ No puedo hacerte admin porque *yo no soy administrador* del grupo.')
  }

  // Verifica si ya es admin
  const isAlreadyAdmin = participants.find(p => p.id === senderJid)?.admin
  if (isAlreadyAdmin) {
    return m.reply('✅ Ya sos administrador de este grupo.')
  }

  // Promueve al dueño a admin
  try {
    await conn.groupParticipantsUpdate(m.chat, [senderJid], 'promote')
    await conn.sendMessage(m.chat, {
      text: `🛡️ @${senderID} ha sido promovido a *Administrador* por el bot.`,
      mentions: [senderJid]
    })
  } catch (e) {
    await m.reply('❌ No pude hacerte admin. Asegurate de que tenga permisos suficientes.')
  }
}
handler.command = /^autoadmin$/i
handler.group = true

export default handler
