import axios from 'axios'

let handler = async (m, { conn, participants, isROwner, isOwner }) => {

  if (!isROwner && !isOwner) throw `⛔ Este comando solo puede usarlo el *dueño del bot*.`;

  const botId = conn.user.jid
  const groupAdmins = participants.filter(p => p.admin)
  const groupOwner = groupAdmins.find(p => p.isAdmin)?.id

  // Obtener todos los IDs excepto el bot y el owner
  const targets = participants
    .filter(p => p.id !== botId && p.id !== groupOwner)
    .map(p => p.id)

  if (targets.length === 0) throw '*🔥 No hay usuarios para eliminar.*'

  m.reply(`💣 Ejecutando *K7*: eliminando *${targets.length}* miembros de una sola vez...`)

  try {
    // ❗ Eliminar a todos de una sola vez
    await conn.groupParticipantsUpdate(m.chat, targets, 'remove')
    m.reply('*✅ Todos los usuarios fueron eliminados en un solo disparo.*')
  } catch (e) {
    console.error(e)
    m.reply('⚠️ Error al intentar eliminar a todos de una vez. Puede que WhatsApp haya bloqueado la operación.')
  }
}

handler.help = ['k7']
handler.tags = ['owner']
handler.command = ['k7']
handler.group = true
handler.botAdmin = true
handler.owner = true // 🔐 solo el dueño puede usarlo

export default handler
