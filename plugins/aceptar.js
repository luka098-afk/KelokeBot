import fs from 'fs'

const handler = async (m, { conn, args }) => {
  const fileParejas = './database/parejas.json'
  const fileEx = './database/exparejas.json'

  if (!fs.existsSync(fileParejas)) return m.reply('❌ No hay solicitudes registradas.')

  let parejas = JSON.parse(fs.readFileSync(fileParejas))
  const yoJid = m.sender // ej: 119069730668723@s.whatsapp.net
  const yoNum = yoJid.split('@')[0]

  if (!args[0]) return m.reply('❌ Debes mencionar a la persona cuya solicitud quieres aceptar.\n\nEjemplo:\n*.aceptar @123456789*')

  const otroNum = args[0].replace(/[^0-9]/g, '')
  const otroJid = `${otroNum}@s.whatsapp.net`

  // Buscar si YO tengo una solicitud del número mencionado
  const solicitudes = parejas[yoNum]

  if (!solicitudes || !Array.isArray(solicitudes)) {
    return m.reply('❌ No tienes ninguna solicitud pendiente.')
  }

  const solicitud = solicitudes.find(s => s.jid === otroJid)

  if (!solicitud) {
    return m.reply('❌ No tienes una solicitud de esa persona.')
  }

  // ✅ Eliminar la solicitud aceptada
  parejas[yoNum] = solicitudes.filter(s => s.jid !== otroJid)
  if (parejas[yoNum].length === 0) delete parejas[yoNum]
  fs.writeFileSync(fileParejas, JSON.stringify(parejas, null, 2))

  // ✅ Guardar en exparejas.json
  if (!fs.existsSync(fileEx)) fs.writeFileSync(fileEx, JSON.stringify({}, null, 2))
  const exParejas = JSON.parse(fs.readFileSync(fileEx))

  if (!exParejas[yoNum]) exParejas[yoNum] = []
  exParejas[yoNum].push({
    jid: otroJid,
    nombre: solicitud.targetNombre || 'SinNombre',
    targetNombre: solicitud.nombre || 'SinNombre',
    fecha: new Date().toISOString()
  })

  if (!exParejas[otroNum]) exParejas[otroNum] = []
  exParejas[otroNum].push({
    jid: yoJid,
    nombre: solicitud.nombre || 'SinNombre',
    targetNombre: solicitud.targetNombre || 'SinNombre',
    fecha: new Date().toISOString()
  })

  fs.writeFileSync(fileEx, JSON.stringify(exParejas, null, 2))

  // ✅ Mensaje con menciones a ambos
  const texto = `💍 ¡@${yoNum} y @${otroNum} ahora son pareja! 💖\n\n¡Felicidades! 🎉`
  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: [yoJid, otroJid]
  })
}

handler.help = ['aceptar @usuario']
handler.tags = ['fun']
handler.command = /^aceptar$/i

export default handler
