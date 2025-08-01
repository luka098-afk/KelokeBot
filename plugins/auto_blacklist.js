import fs from 'fs'

const handler = async (m, { conn }) => {
  // Solo procesar eventos de unión al grupo
  if (!m.messageStubType) return

  const isJoin =
    m.messageStubType === 27 || // agregado por admin
    m.messageStubType === 28    // se unió por enlace

  if (!isJoin) return

  // Obtener participantes que se unieron
  const participants = m.messageStubParameters || []
  if (!participants.length) return

  // Cargar lista negra
  let blacklist = []
  try {
    const data = fs.readFileSync('./database/listanegra.json', 'utf8')
    blacklist = JSON.parse(data)
  } catch (error) {
    console.log('No se pudo cargar listanegra.json:', error.message)
    blacklist = []
  }

  // Verificar si la lista negra tiene datos
  if (!blacklist.length) return

  // Procesar cada usuario que se unió
  for (let user of participants) {
    const blockedUser = blacklist.find(u => u.jid === user)
    
    if (blockedUser) {
      try {
        // Expulsar al usuario
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        
        // Enviar mensaje de notificación
        const message = `🚫 *USUARIO EXPULSADO AUTOMÁTICAMENTE*\n\n` +
                       `👤 Usuario: @${user.split('@')[0]}\n` +
                       `📝 Razón: *${blockedUser.razon || 'Sin razón especificada'}*\n` +
                       `⚠️ Este usuario está en la lista negra del bot.`
        
        await conn.sendMessage(m.chat, {
          text: message,
          mentions: [user]
        })
        
        console.log(`Usuario expulsado: ${user} - Razón: ${blockedUser.razon}`)
        
      } catch (error) {
        console.error(`Error al expulsar a ${user}:`, error)
        
        // Notificar el error a los admins si no se pudo expulsar
        await conn.sendMessage(m.chat, {
          text: `⚠️ No se pudo expulsar a @${user.split('@')[0]} (está en lista negra)\n` +
                `Razón del bloqueo: *${blockedUser.razon || 'Sin razón'}*\n` +
                `Error: Permisos insuficientes o usuario ya no está en el grupo.`,
          mentions: [user]
        })
      }
    }
  }
}

// Configuración del handler
handler.before = true
handler.group = true
handler.participant = true

export default handler
