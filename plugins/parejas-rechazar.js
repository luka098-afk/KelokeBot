import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args }) => {
  const solicitudesPath = path.join('./database', 'solicitudes.json')

  if (!fs.existsSync(solicitudesPath)) return m.reply('❌ No hay solicitudes registradas.')

  let solicitudes = {}
  try {
    solicitudes = JSON.parse(fs.readFileSync(solicitudesPath))
  } catch {
    solicitudes = {}
  }

  const yoJid = m.sender
  const yoRaw = yoJid.split('@')[0]
  const isGroup = m.isGroup || m.chat.endsWith('@g.us')

  if (!args[0] && !(m.mentionedJid && m.mentionedJid.length > 0)) {
    return m.reply('❌ Debes escribir o mencionar a la persona cuya solicitud quieres rechazar.\n\nEjemplo:\n*.rechazar @123456789*')
  }

  let otro, otroRaw

  // Método 1: mención directa
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    otro = m.mentionedJid[0]
    otroRaw = otro.split('@')[0]
  } else {
    // Método 2: número en texto
    const numMatch = args[0].match(/\d{5,15}/)
    if (!numMatch) return m.reply('⚠️ Formato inválido. Usa un número o mención.')
    otroRaw = numMatch[0]

    if (isGroup) {
      const senderDomain = yoJid.split('@')[1]
      otro = `${otroRaw}@${senderDomain}`
    } else {
      otro = `${otroRaw}@s.whatsapp.net`
    }
  }

  // Buscar la solicitud enviada a mí por esa persona
  const misSolicitudes = solicitudes[yoJid] || solicitudes[yoRaw]
  if (!misSolicitudes || !Array.isArray(misSolicitudes)) {
    return m.reply('❌ No tienes ninguna solicitud pendiente.')
  }

  const solicitud = misSolicitudes.find(s =>
    s.jid === otro || s.numero === otroRaw
  )
  if (!solicitud) {
    return m.reply('❌ No tienes una solicitud de esa persona.')
  }

  // Eliminar la solicitud rechazada
  solicitudes[yoJid] = misSolicitudes.filter(s => s.jid !== otro && s.numero !== otroRaw)
  if (solicitudes[yoJid]?.length === 0) delete solicitudes[yoJid]
  fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))

  // Mensaje con menciones reales
  const mensaje = `💔 *@${yoRaw} ha rechazado la solicitud de @${otroRaw}...* 💔

📜 *Poema del desamor* 📜
_"Te vi llegar con ojos brillantes,_
_y yo soñaba con instantes vibrantes._
_Pero el amor no siempre se logra alcanzar,_
_y a veces solo queda dejarlo pasar."_ 💔

😔 No te desanimes, el verdadero amor llega cuando menos lo esperas.`

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [yoJid, otro]
  })
}

handler.help = ['rechazar @usuario']
handler.tags = ['pareja']
handler.command = /^rechazar$/i

export default handler
