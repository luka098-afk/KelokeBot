// aceptar.js
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const sender = m.sender // ej: 59896367249@s.whatsapp.net
    const senderRaw = sender.split('@')[0]

    const solicitudesPath = './database/solicitudes.json'
    const parejasPath = './database/parejas.json'

    let solicitudes = {}
    let parejas = {}

    if (fs.existsSync(solicitudesPath)) {
      solicitudes = JSON.parse(fs.readFileSync(solicitudesPath))
    }

    if (fs.existsSync(parejasPath)) {
      parejas = JSON.parse(fs.readFileSync(parejasPath))
    }

    const solicitudesPendientes = solicitudes[senderRaw]
    if (!solicitudesPendientes || solicitudesPendientes.length === 0) {
      return m.reply('❌ No tienes ninguna solicitud pendiente.')
    }

    // Aceptar la primera solicitud
    const declarador = solicitudesPendientes[0].jid
    const declaradorRaw = declarador.split('@')[0]

    // Guardar en parejas
    parejas[senderRaw] = { pareja: declaradorRaw }
    parejas[declaradorRaw] = { pareja: senderRaw }

    // Eliminar todas las solicitudes pendientes de esa persona
    delete solicitudes[senderRaw]

    // Guardar archivos actualizados
    fs.writeFileSync(parejasPath, JSON.stringify(parejas, null, 2))
    fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))

    const texto = `💞 ¡Felicidades! 💞

@${senderRaw} ha aceptado a @${declaradorRaw} como su pareja oficial 💖

¡Que viva el amor! 🌹`

    await conn.sendMessage(m.chat, {
      text: texto,
      mentions: [`${senderRaw}@s.whatsapp.net`, `${declaradorRaw}@s.whatsapp.net`]
    })
  } catch (e) {
    console.error('[.aceptar] error:', e)
    m.reply('❌ Hubo un error al aceptar la solicitud.')
  }
}

handler.help = ['aceptar']
handler.tags = ['pareja']
handler.command = /^aceptar$/i

export default handler
