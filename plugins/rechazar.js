import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  try {
    // Obtener el JID completo del remitente
    const sender = m.sender // Ya viene en formato correcto con @s.whatsapp.net
    const senderRaw = sender.split('@')[0] // Solo el número

    // Leer solicitudes
    const solicitudesPath = path.join('./database', 'solicitudes.json')
    let solicitudes = {}
    try {
      solicitudes = JSON.parse(fs.readFileSync(solicitudesPath))
    } catch (e) {
      return m.reply('❌ No hay solicitudes pendientes.')
    }

    if (!solicitudes[senderRaw] || solicitudes[senderRaw].length === 0) {
      return m.reply('❌ No tienes solicitudes pendientes.')
    }

    const solicitud = solicitudes[senderRaw][0]
    // Asegurar que target tenga el formato JID correcto
    let target = solicitud.jid || solicitud
    
    // Si target no tiene @, agregar el dominio de WhatsApp
    if (!target.includes('@')) {
      target = `${target}@s.whatsapp.net`
    }
    
    const targetRaw = target.split('@')[0]

    // Eliminar solicitud
    solicitudes[senderRaw] = solicitudes[senderRaw].filter(s => {
      const compareTarget = s.jid || s
      const normalizedCompare = compareTarget.includes('@') ? compareTarget : `${compareTarget}@s.whatsapp.net`
      return normalizedCompare !== target
    })
    
    if (solicitudes[senderRaw].length === 0) {
      delete solicitudes[senderRaw]
    }

    fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))

    // Crear el mensaje con ambas menciones
    const mensaje = `💔 *Parece que @${senderRaw} ha rechazado la solicitud de @${targetRaw}...*

📜 *Poema del desamor* 📜
_"Te vi llegar con ojos brillantes,_
_y yo soñaba con instantes vibrantes._
_Pero el amor no siempre se logra alcanzar,_
_y a veces solo queda dejarlo pasar."_ 💔

😔 No te desanimes, el verdadero amor llega cuando menos lo esperas.`

    // Enviar mensaje con menciones correctas
    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [sender, target] // Ambos JIDs en formato completo
    })

    console.log(`Rechazado: ${senderRaw} rechazó a ${targetRaw}`)
    console.log(`Menciones enviadas a: [${sender}, ${target}]`)

  } catch (error) {
    console.error('Error en .rechazar:', error)
    m.reply('❌ Ocurrió un error al rechazar la declaración.')
  }
}

handler.help = ['rechazar']
handler.tags = ['pareja']
handler.command = /^rechazar$/i

export default handler
