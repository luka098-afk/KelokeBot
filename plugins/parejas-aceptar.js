import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args }) => {
  const solicitudesPath = path.join('./database', 'solicitudes.json')
  const parejasPath = path.join('./database', 'parejas.json')

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
    return m.reply('❌ Debes escribir o mencionar a la persona cuya solicitud quieres aceptar.\n\nEjemplo:\n*.aceptar @123456789*')
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

  // Eliminar la solicitud aceptada
  solicitudes[yoJid] = misSolicitudes.filter(s => s.jid !== otro && s.numero !== otroRaw)
  if (solicitudes[yoJid]?.length === 0) delete solicitudes[yoJid]
  fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))

  // Guardar pareja
  if (!fs.existsSync(parejasPath)) fs.writeFileSync(parejasPath, JSON.stringify({}, null, 2))
  const parejas = JSON.parse(fs.readFileSync(parejasPath))
  const fecha = new Date().toISOString()

  parejas[yoJid] = { pareja: otro, desde: fecha }
  parejas[otro] = { pareja: yoJid, desde: fecha }
  fs.writeFileSync(parejasPath, JSON.stringify(parejas, null, 2))

  // Mensaje con menciones reales
  const mensaje = `💖 *¡Felicidades! Ahora están oficialmente en pareja* 💖

@${yoRaw} ❤️ @${otroRaw}

🌹 *Un nuevo amor florece* 🌹
_"Se cruzaron las almas sin buscarse,_
y el destino las unió sin avisar._
Ahora caminan juntas, paso a paso,_
en un mismo compás, en un mismo amar."_ 💕

✨ Que su amor crezca fuerte y hermoso. ✨`

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [yoJid, otro]
  })
}

handler.help = ['aceptar @usuario']
handler.tags = ['pareja']
handler.command = /^aceptar$/i

export default handler
