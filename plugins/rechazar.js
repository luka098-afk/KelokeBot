// rechazar.js
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  try {
    // USAR EXACTAMENTE LA MISMA LÓGICA QUE .pareja
    // Quien rechaza es el "sender" (igual que en .pareja)
    const senderRaw = m.sender.split('@')[0]
    const sender = `${senderRaw}@s.whatsapp.net`

    // Leer solicitudes
    const solicitudesPath = path.join('./database', 'solicitudes.json')
    let solicitudes = {}
    try {
      solicitudes = JSON.parse(fs.readFileSync(solicitudesPath))
    } catch (e) {
      return m.reply('❌ No hay solicitudes pendientes.')
    }

    // Verificar que tiene solicitudes
    if (!solicitudes[senderRaw] || solicitudes[senderRaw].length === 0) {
      return m.reply('❌ No tienes solicitudes pendientes.')
    }

    // Tomar la primera solicitud (más antigua) - este es el "target"
    const solicitud = solicitudes[senderRaw][0]
    const target = solicitud.jid || solicitud // Compatibilidad con formato anterior
    const targetRaw = target.split('@')[0]

    // Eliminar la solicitud
    solicitudes[senderRaw] = solicitudes[senderRaw].filter(s => 
      (s.jid || s) !== target
    )
    if (solicitudes[senderRaw].length === 0) {
      delete solicitudes[senderRaw]
    }

    // Guardar cambios
    fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))

    // APLICAR LA MISMA LÓGICA EXACTA QUE .pareja
    // Limpiar y normalizar JIDs
    const senderClean = m.sender.includes('@') ? m.sender : `${m.sender}@s.whatsapp.net`
    const targetClean = target.includes('@') ? target : `${target}@s.whatsapp.net`
    
    // Extraer números limpios para el texto
    const senderNum = senderClean.split('@')[0]
    const targetNum = targetClean.split('@')[0]
    
    const mensaje = `💔 @${senderNum} ha rechazado la declaración de @${targetNum}

😔 Lo siento, pero no todos los amores son correspondidos.

💪 ¡Ánimo! Siempre hay alguien especial esperando por ti.`

    // Asegurar que usamos los JIDs correctos
    const mentionsArray = [senderClean, targetClean]
    
    console.log('RECHAZAR DEBUG:', {
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
    console.error('Error en .rechazar:', error)
    m.reply('❌ Ocurrió un error al rechazar la declaración.')
  }
}

handler.help = ['rechazar']
handler.tags = ['pareja']
handler.command = /^rechazar$/i

export default handler

handler.help = ['rechazar']
handler.tags = ['pareja']
handler.command = /^rechazar$/i

export default handler
