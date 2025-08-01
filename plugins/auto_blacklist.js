import fs from 'fs'

const handler = async (m, { conn }) => {
  // Cargar lista negra
  let blacklist = []
  try {
    const data = fs.readFileSync('./database/listanegra.json', 'utf8')
    blacklist = JSON.parse(data)
  } catch (error) {
    console.log('No se pudo cargar listanegra.json:', error.message)
    blacklist = []
  }

  if (!blacklist.length) return

  // CASO 1: Manejo de eventos de grupo (uniones, solicitudes, etc)
  if (m.messageStubType) {
    const isJoin = m.messageStubType === 27 || m.messageStubType === 28 // unión al grupo
    const isJoinRequest = m.messageStubType === 30 // solicitud de unión
    const isJoinRequestAccept = m.messageStubType === 31 // solicitud aceptada
    
    if (isJoin || isJoinRequestAccept) {
      // Procesar uniones al grupo
      const participants = m.messageStubParameters || []
      if (!participants.length) return

      for (let user of participants) {
        const blockedUser = blacklist.find(u => u.jid === user)
        
        if (blockedUser) {
          try {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            
            const message = `🚫 *USUARIO EXPULSADO AUTOMÁTICAMENTE*\n\n` +
                           `👤 Usuario: @${user.split('@')[0]}\n` +
                           `📝 Razón: *${blockedUser.razon || 'Sin razón especificada'}*\n` +
                           `⚠️ Este usuario está en la lista negra del bot.`
            
            await conn.sendMessage(m.chat, {
              text: message,
              mentions: [user]
            })
            
            console.log(`Usuario expulsado por unión: ${user} - Razón: ${blockedUser.razon}`)
            
          } catch (error) {
            console.error(`Error al expulsar a ${user}:`, error)
          }
        }
      }
    }
    
    if (isJoinRequest) {
      // Rechazar solicitudes de usuarios en lista negra
      const requestUser = m.messageStubParameters?.[0]
      if (requestUser) {
        const blockedUser = blacklist.find(u => u.jid === requestUser)
        
        if (blockedUser) {
          try {
            await conn.groupRequestParticipantsUpdate(m.chat, [requestUser], 'reject')
            
            console.log(`Solicitud rechazada: ${requestUser} - Razón: ${blockedUser.razon}`)
            
            // Notificar a los admins sobre la solicitud rechazada
            await conn.sendMessage(m.chat, {
              text: `🚫 *SOLICITUD RECHAZADA AUTOMÁTICAMENTE*\n\n` +
                    `👤 Usuario: @${requestUser.split('@')[0]}\n` +
                    `📝 Razón: *${blockedUser.razon || 'Sin razón especificada'}*\n` +
                    `⚠️ Este usuario está en la lista negra del bot.`,
              mentions: [requestUser]
            })
            
          } catch (error) {
            console.error(`Error al rechazar solicitud de ${requestUser}:`, error)
          }
        }
      }
    }
    
    return // Terminar aquí para eventos de stub
  }

  // CASO 2: Usuario en lista negra envía mensaje en grupo
  if (m.isGroup && m.sender) {
    const blockedUser = blacklist.find(u => u.jid === m.sender)
    
    if (blockedUser) {
      try {
        // Eliminar el mensaje primero
        await conn.sendMessage(m.chat, { delete: m.key })
        
        // Expulsar al usuario
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        
        const message = `🚫 *USUARIO EXPULSADO AUTOMÁTICAMENTE*\n\n` +
                       `👤 Usuario: @${m.sender.split('@')[0]}\n` +
                       `📝 Razón: *${blockedUser.razon || 'Sin razón especificada'}*\n` +
                       `⚠️ Este usuario está en la lista negra y no puede participar en grupos.`
        
        await conn.sendMessage(m.chat, {
          text: message,
          mentions: [m.sender]
        })
        
        console.log(`Usuario expulsado por mensaje: ${m.sender} - Razón: ${blockedUser.razon}`)
        
      } catch (error) {
        console.error(`Error

// Configuración del handler
handler.before = true
handler.group = true
handler.participant = true

export default handler
