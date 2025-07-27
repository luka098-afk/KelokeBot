// pareja.js
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply('⚠️ Debes mencionar a la persona a la que quieres declarar tu amor. Ejemplo: .pareja @59896367249')

    // Obtener el sender
    const senderRaw = m.sender.split('@')[0]
    const sender = `${senderRaw}@s.whatsapp.net`
    const senderName = conn.getName(sender) || senderRaw // Obtener nombre/contacto

    let target, targetRaw, targetName

    // Intentar extraer de las menciones del mensaje (cuando usan @lid)
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      target = m.mentionedJid[0]
      targetRaw = target.split('@')[0]
      targetName = conn.getName(target) || targetRaw // Obtener nombre/contacto
    } else {
      // Fallback: extraer del texto (cuando escriben @número)
      const matches = text.match(/@(\d{5,15})/)
      if (!matches) return m.reply('⚠️ Formato inválido. Usa: .pareja @número o menciona a la persona')
      
      targetRaw = matches[1]
      target = `${targetRaw}@s.whatsapp.net`
      targetName = conn.getName(target) || targetRaw // Obtener nombre/contacto
    }

    if (target === sender) return m.reply('❌ No puedes declararte a ti mismo.')

    // Leer o crear solicitudes - GUARDAR NOMBRES/LID
    const solicitudesPath = path.join('./database', 'solicitudes.json')
    let solicitudes = {}
    try {
      solicitudes = JSON.parse(fs.readFileSync(solicitudesPath))
    } catch (e) {
      solicitudes = {}
    }

    // Verificar si ya existe solicitud usando JID completo
    const existingSolicitud = solicitudes[targetRaw]?.find(s => s.jid === sender)
    if (existingSolicitud) {
      return m.reply('❌ Ya enviaste una solicitud a esa persona.')
    }

    // Guardar solicitud con nombres/lid
    if (!solicitudes[targetRaw]) solicitudes[targetRaw] = []
    solicitudes[targetRaw].push({
      jid: sender,
      nombre: senderName,
      targetNombre: targetName,
      fecha: new Date().toISOString()
    })

    fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))

    // VERIFICACIÓN COMPLETA: Asegurar formato correcto de JIDs
    
    // Limpiar y normalizar JIDs
    const senderClean = m.sender.includes('@') ? m.sender : `${m.sender}@s.whatsapp.net`
    const targetClean = target.includes('@') ? target : `${target}@s.whatsapp.net`
    
    // Extraer números limpios para el texto
    const senderNum = senderClean.split('@')[0]
    const targetNum = targetClean.split('@')[0]
    
    const mensaje = `💖 ¡Declaración de amor! 💖

@${senderNum} se ha declarado a @${targetNum}

💕 ¡Qué momento tan especial! 💕

Para aceptar la declaración escribe:
*.aceptar @${senderNum}*

Para rechazar la declaración escribe:
*.rechazar @${senderNum}*

¡Que el amor florezca! 🌹`

    // Asegurar que usamos los JIDs correctos
    const mentionsArray = [senderClean, targetClean]
    
    console.log('FINAL DEBUG:', {
      senderClean,
      targetClean,
      senderNum,
      targetNum,
      mentionsArray,
      mensaje: mensaje.substring(0, 100) + '...'
    })

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: mentionsArray
    })
  } catch (error) {
    console.error('Error en .pareja:', error)
    m.reply('❌ Ocurrió un error al enviar tu declaración.')
  }
}

handler.help = ['pareja @número']
handler.tags = ['pareja']
handler.command = /^pareja$/i

export default handler
