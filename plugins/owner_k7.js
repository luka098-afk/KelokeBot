import axios from 'axios'

let handler = async (m, { conn, participants, isROwner, isOwner }) => {

  if (!isROwner && !isOwner) throw `⛔ Este comando solo puede usarlo el *dueño del bot*.`;

  try {
    const botId = conn.user.jid
    const groupAdmins = participants.filter(p => p.admin)
    const groupOwner = groupAdmins.find(p => p.isAdmin)?.id

    // Obtener todos los IDs excepto el bot y el owner
    const targets = participants
      .filter(p => p.id !== botId && p.id !== groupOwner)
      .map(p => p.id)

    if (targets.length === 0) {
      console.log(`[K7] No hay usuarios para eliminar en el chat: ${m.chat}`)
      throw '*🔥 No hay usuarios para eliminar.*'
    }

    console.log(`[K7] Iniciando eliminación de ${targets.length} miembros en ${m.chat}`)
    m.reply(`💣 Ejecutando *K7*: eliminando *${targets.length}* miembros de una sola vez...`)

    // Eliminar a todos de una sola vez
    await conn.groupParticipantsUpdate(m.chat, targets, 'remove')
    
    console.log(`[K7] Operación completada exitosamente en ${m.chat}`)

  } catch (error) {
    console.error(`[K7] Error en el comando K7:`, {
      chat: m.chat,
      error: error.message || error,
      stack: error.stack
    })
    
    if (error.message && error.message.includes('No hay usuarios')) {
      throw error
    } else {
      m.reply('⚠️ Error al intentar eliminar usuarios. Revisa la consola para más detalles.')
    }
  }
}

handler.help = ['k7']
handler.tags = ['owner']
handler.command = ['k7']
handler.group = true
handler.botAdmin = true
handler.owner = true

export default handler
