import fs from 'fs'

const handler = async (m, { conn }) => {
  try {
    // Debug: mostrar información del mensaje
    console.log('=== DEBUG AUTO-KICK ===')
    console.log('messageStubType:', m.messageStubType)
    console.log('isGroup:', m.isGroup)
    console.log('sender:', m.sender)
    console.log('chat:', m.chat)
    console.log('messageStubParameters:', m.messageStubParameters)
    
    // Cargar lista negra
    let blacklist = []
    try {
      const data = fs.readFileSync('./database/listanegra.json', 'utf8')
      blacklist = JSON.parse(data)
      console.log('Lista negra cargada:', blacklist.length, 'usuarios')
    } catch (error) {
      console.log('Error cargando lista negra:', error.message)
      return
    }

    if (!blacklist.length) {
      console.log('Lista negra vacía')
      return
    }

    // CASO 1: Eventos de grupo (uniones, solicitudes)
    if (m.messageStubType) {
      console.log('Procesando evento de grupo...')
      
      const joinEvents = [27, 28, 31] // agregado por admin, unión por enlace, solicitud aceptada
      const requestEvent = 30 // solicitud de unión
      
      if (joinEvents.includes(m.messageStubType)) {
        console.log('Evento de unión detectado')
        const participants = m.messageStubParameters || []
        
        if (!participants.length) {
          console.log('No hay participantes en el evento')
          return
        }

        for (let user of participants) {
          console.log('Verificando usuario:', user)
          
          // Normalizar JIDs para comparación
          const normalizeJid = (jid) => {
            if (!jid) return ''
            // Extraer solo el número del JID
            return jid.split('@')[0]
          }
          
          const userNumber = normalizeJid(user)
          console.log('Número del usuario:', userNumber)
          
          const blockedUser = blacklist.find(u => {
            const blockedNumber = normalizeJid(u.jid)
            console.log('Comparando:', userNumber, 'con', blockedNumber)
            return blockedNumber === userNumber
          })
          
          if (blockedUser) {
            console.log('Usuario encontrado en lista negra:', user)
            
            try {
              // Esperar un momento antes de expulsar
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              const result = await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
              console.log('Resultado de expulsión:', result)
              
              const message = `🚫 *USUARIO EXPULSADO*\n\n` +
                             `👤 @${user.split('@')[0]}\n` +
                             `📝 Razón: ${blockedUser.razon || 'En lista negra'}`
              
              await conn.sendMessage(m.chat, {
                text: message,
                mentions: [user]
              })
              
            } catch (error) {
              console.error('Error expulsando usuario:', error)
              
              // Intentar método alternativo
              try {
                await conn.sendMessage(m.chat, {
                  text: `⚠️ No se pudo expulsar a @${user.split('@')[0]} automáticamente.\nMotivo: ${blockedUser.razon || 'Lista negra'}\n\n*Requiere intervención manual de un admin.*`,
                  mentions: [user]
                })
              } catch (e) {
                console.error('Error enviando mensaje de error:', e)
              }
            }
          } else {
            console.log('Usuario no está en lista negra:', user)
          }
        }
      }
      
      if (m.messageStubType === requestEvent) {
        console.log('Solicitud de unión detectada')
        const requestUser = m.messageStubParameters?.[0]
        
        if (requestUser) {
          const userNumber = requestUser.split('@')[0]
          console.log('Número solicitante:', userNumber)
          
          const blockedUser = blacklist.find(u => {
            const blockedNumber = u.jid.split('@')[0]
            return blockedNumber === userNumber
          })
          
          if (blockedUser) {
            console.log('Rechazando solicitud de:', requestUser)
            
            try {
              await conn.groupRequestParticipantsUpdate(m.chat, [requestUser], 'reject')
              
              await conn.sendMessage(m.chat, {
                text: `🚫 Solicitud rechazada: @${requestUser.split('@')[0]}\nRazón: ${blockedUser.razon || 'Lista negra'}`,
                mentions: [requestUser]
              })
              
            } catch (error) {
              console.error('Error rechazando solicitud:', error)
            }
          }
        }
      }
      
      return // Terminar aquí para eventos stub
    }

    // CASO 2: Usuario envía mensaje
    if (m.isGroup && m.sender && m.text) {
      console.log('Verificando mensaje de:', m.sender)
      
      const senderNumber = m.sender.split('@')[0]
      console.log('Número del remitente:', senderNumber)
      
      const blockedUser = blacklist.find(u => {
        const blockedNumber = u.jid.split('@')[0]
        console.log('Comparando remitente:', senderNumber, 'con bloqueado:', blockedNumber)
        return blockedNumber === senderNumber
      })
      
      if (blockedUser) {
        console.log('Usuario bloqueado envió mensaje:', m.sender)
        
        try {
          // Intentar borrar el mensaje primero
          await conn.sendMessage(m.chat, { delete: m.key }).catch(e => console.log('No se pudo borrar mensaje:', e))
          
          // Esperar un momento
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Expulsar usuario
          const result = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
          console.log('Usuario expulsado por mensaje:', result)
          
          await conn.sendMessage(m.chat, {
            text: `🚫 *USUARIO EXPULSADO*\n\n` +
                  `👤 @${m.sender.split('@')[0]}\n` +
                  `📝 Razón: ${blockedUser.razon || 'En lista negra'}\n` +
                  `⚠️ No puede participar en este grupo.`,
            mentions: [m.sender]
          })
          
        } catch (error) {
          console.error('Error expulsando por mensaje:', error)
          
          // Si no se puede expulsar, avisar a los admins
          try {
            await conn.sendMessage(m.chat, {
              text: `⚠️ *ALERTA ADMIN*\n\nUsuario en lista negra: @${m.sender.split('@')[0]}\n` +
                    `Razón: ${blockedUser.razon || 'Lista negra'}\n\n` +
                    `El bot no pudo expulsarlo automáticamente. Acción manual requerida.`,
              mentions: [m.sender]
            })
          } catch (e) {
            console.error('Error enviando alerta:', e)
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error general en auto-kick:', error)
  }
}

// Configuración del handler
handler.before = true
handler.group = true

export default handler
