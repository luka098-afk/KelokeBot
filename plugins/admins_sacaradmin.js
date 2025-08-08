const demoteHandler = async (m, { conn, participants, isBotAdmin, isAdmin, args }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.')
  if (!isBotAdmin) return m.reply('❌ El bot necesita ser administrador para quitar admin.')

  let user
  if (m.mentionedJid?.length) {
    user = m.mentionedJid[0]
  } else if (m.quoted) {
    user = m.quoted.sender
  } else if (args[0]) {
    user = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  } else {
    return m.reply('❌ Menciona, responde o escribe el número del usuario al que deseas quitar admin.')
  }

  const isParticipant = participants.some(p => p.id === user)
  if (!isParticipant) return m.reply('❌ El usuario no está en este grupo.')

  try {
    await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
    m.reply(`✅ Se ha quitado admin a @${user.split('@')[0]}`, null, { mentions: [user] })
  } catch (e) {
    m.reply('⚠️ No se pudo quitar admin. Asegúrate de que el bot tenga permisos.')
  }
}

demoteHandler.command = ['d', 'demote']
demoteHandler.group = true
demoteHandler.botAdmin = false
demoteHandler.admin = true
demoteHandler.tags = ['grupo']
demoteHandler.help = ['d @usuario', 'demote @usuario']

export default demoteHandler
