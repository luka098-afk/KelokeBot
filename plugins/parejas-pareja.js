import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply('⚠️ Debes mencionar a la persona a la que quieres declarar tu amor. Ejemplo: .pareja @59896367249')

    // Detectar contexto
    const isGroup = m.isGroup || m.chat.endsWith('@g.us')
    
    console.log('=== PAREJA DEBUG ===')
    console.log('Context:', { isGroup, chatId: m.chat })
    console.log('Sender original:', m.sender)
    console.log('Mentioned JIDs:', m.mentionedJid)
    console.log('Text:', text)

    // Normalizar JID del sender (quien envía el comando)
    let sender = m.sender
    let senderRaw = sender.split('@')[0]
    
    // En grupos, algunos bots guardan con @c.us, otros con @s.whatsapp.net
    // Vamos a usar el formato original del sender
    console.log('Sender procesado:', { sender, senderRaw })

    let target, targetRaw

    // Método 1: Usar menciones directas (más confiable)
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      target = m.mentionedJid[0]
      targetRaw = target.split('@')[0]
      console.log('Target desde menciones:', { target, targetRaw })
      
    } else {
      // Método 2: Extraer del texto manualmente
      const matches = text.match(/@(\d{5,15})/g)
      if (!matches) return m.reply('⚠️ Formato inválido. Menciona a la persona o usa: .pareja @número')

      targetRaw = matches[0].replace('@', '')
      
      // En grupos, intentar diferentes formatos para el target
      if (isGroup) {
        // Probar formatos comunes en grupos
        const possibleFormats = [
          `${targetRaw}@c.us`,
          `${targetRaw}@s.whatsapp.net`,
          `${targetRaw}@lid`
        ]
        
        // Usar el mismo formato que el sender si es posible
        const senderDomain = sender.split('@')[1]
        target = `${targetRaw}@${senderDomain}`
        
        console.log('Target construido para grupo:', { 
          target, 
          targetRaw, 
          senderDomain,
          possibleFormats 
        })
      } else {
        // En chat privado, usar formato estándar
        target = `${targetRaw}@s.whatsapp.net`
        console.log('Target para privado:', { target, targetRaw })
      }
    }

    // Validaciones
    if (target === sender || targetRaw === senderRaw) {
      return m.reply('❌ No puedes declararte a ti mismo.')
    }

    // Obtener nombres
    const senderName = conn.getName(sender) || senderRaw
    const targetName = conn.getName(target) || targetRaw

    console.log('Nombres obtenidos:', { senderName, targetName })

    // Leer solicitudes existentes
    const solicitudesPath = path.join('./database', 'solicitudes.json')
    let solicitudes = {}
    try {
      solicitudes = JSON.parse(fs.readFileSync(solicitudesPath))
    } catch (e) {
      solicitudes = {}
    }

    // Verificar solicitud existente - usar targetRaw como clave para evitar problemas de formato
    const claveTarget = target
    const existingSolicitud = solicitudes[claveTarget]?.find(s => 
      s.jid === sender || s.numero === senderRaw
    )
    
    if (existingSolicitud) {
      return m.reply(`❌ Ya enviaste una solicitud a @${targetRaw}.`, null, { mentions: [target] })
    }

    // Guardar solicitud
    if (!solicitudes[claveTarget]) solicitudes[claveTarget] = []
    
    const nuevaSolicitud = {
      jid: sender,
      targetJid: target,
      nombre: senderName,
      targetNombre: targetName,
      numero: senderRaw,
      targetNumero: targetRaw,
      isGroup: isGroup,
      chatContext: m.chat,
      fecha: new Date().toISOString()
    }
    
    solicitudes[claveTarget].push(nuevaSolicitud)

    // Crear directorio si no existe
    const dbDir = path.dirname(solicitudesPath)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))

    console.log('Solicitud guardada:', {
      clave: claveTarget,
      solicitud: nuevaSolicitud
    })

    // Preparar mensaje
    const mensaje = `💖 ¡Declaración de amor! 💖

@${senderRaw} se ha declarado a @${targetRaw}

💕 ¡Qué momento tan especial! 💕

@${targetRaw} para aceptar la declaración escribe:
*.aceptar @${senderRaw}*

Para rechazar la declaración escribe:
*.rechazar @${senderRaw}*

¡Que el amor florezca! 🌹`

    // Preparar menciones - CLAVE: usar los JIDs exactos
    const mentions = [sender, target]
    
    console.log('Enviando mensaje final:')
    console.log('Mentions array:', mentions)
    console.log('Sender:', sender)
    console.log('Target:', target)

    // Enviar mensaje con menciones
    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: mentions
    })

    console.log('✅ Mensaje enviado exitosamente')

  } catch (error) {
    console.error('❌ Error en .pareja:', error)
    console.error('Stack trace:', error.stack)
    m.reply('❌ Ocurrió un error al enviar tu declaración. Verifica el formato e inténtalo de nuevo.')
  }
}

handler.help = ['pareja @número']
handler.tags = ['pareja']
handler.command = /^pareja$/i

export default handler
