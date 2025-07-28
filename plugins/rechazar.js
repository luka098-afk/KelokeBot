import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  try {
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

    if (!solicitudes[senderRaw] || solicitudes[senderRaw].length === 0) {
      return m.reply('❌ No tienes solicitudes pendientes.')
    }

    const solicitud = solicitudes[senderRaw][0]
    const target = solicitud.jid || solicitud
    const targetRaw = target.split('@')[0]

    // Eliminar solicitud
    solicitudes[senderRaw] = solicitudes[senderRaw].filter(s =>
      (s.jid || s) !== target
    )
    if (solicitudes[senderRaw].length === 0) {
      delete solicitudes[senderRaw]
    }

    fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))

    const senderClean = m.sender.includes('@') ? m.sender : `${m.sender}@s.whatsapp.net`
    const targetClean = target.includes('@') ? target : `${target}@s.whatsapp.net`

    const senderNum = senderClean.split('@')[0]
    const targetNum = targetClean.split('@')[0]

    const mensaje = `💔 *Parece que @${senderNum} ha rechazado la solicitud de @${targetNum}...*

📜 *Poema del desamor* 📜
_"Te vi llegar con ojos brillantes,_  
y yo soñaba con instantes vibrantes._  
Pero el amor no siempre se logra alcanzar,_  
y a veces solo queda dejarlo pasar."_ 💔

😔 No te desanimes, el verdadero amor llega cuando menos lo esperas.`

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [senderClean, targetClean]
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
