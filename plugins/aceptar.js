import fs from 'fs'

const handler = async (m, { conn, args }) => {
  const fileSolicitudes = './database/solicitudes.json'
  const fileParejas = './database/parejas.json'

  if (!fs.existsSync(fileSolicitudes)) return m.reply('❌ No hay solicitudes registradas.')

  let solicitudes = JSON.parse(fs.readFileSync(fileSolicitudes))
  const yoJid = m.sender
  const yoNum = yoJid.split('@')[0]

  if (!args[0]) return m.reply('❌ Debes escribir o mencionar a la persona cuya solicitud quieres aceptar.\n\nEjemplo:\n*.aceptar @123456789*')

  const otroNum = args[0].replace(/[^0-9]/g, '')
  const otroJid = `${otroNum}@s.whatsapp.net`

  // Verificar si tienes solicitud de esa persona
  const misSolicitudes = solicitudes[yoNum]

  if (!misSolicitudes || !Array.isArray(misSolicitudes)) {
    return m.reply('❌ No tienes ninguna solicitud pendiente.')
  }

  const solicitud = misSolicitudes.find(s => s.jid === otroJid)

  if (!solicitud) {
    return m.reply('❌ No tienes una solicitud de esa persona.')
  }

  // Eliminar solicitud aceptada
  solicitudes[yoNum] = misSolicitudes.filter(s => s.jid !== otroJid)
  if (solicitudes[yoNum].length === 0) delete solicitudes[yoNum]
  fs.writeFileSync(fileSolicitudes, JSON.stringify(solicitudes, null, 2))

  // Guardar pareja en parejas.json
  if (!fs.existsSync(fileParejas)) fs.writeFileSync(fileParejas, JSON.stringify({}, null, 2))
  const parejas = JSON.parse(fs.readFileSync(fileParejas))

  const fecha = new Date().toISOString()

  parejas[yoNum] = {
    pareja: otroJid,
    desde: fecha
  }

  parejas[otroNum] = {
    pareja: yoJid,
    desde: fecha
  }

  fs.writeFileSync(fileParejas, JSON.stringify(parejas, null, 2))

  // Mensaje bonito sin menciones
  const mensaje = `💖 *¡Felicidades! Ahora están oficialmente en pareja* 💖

🌹 *Un nuevo amor florece* 🌹
_"Se cruzaron las almas sin buscarse,_  
y el destino las unió sin avisar._  
Ahora caminan juntas, paso a paso,_  
en un mismo compás, en un mismo amar."_ 💕

✨ Que su amor crezca fuerte y hermoso. ✨`

  await conn.sendMessage(m.chat, {
    text: mensaje
  })
}

handler.help = ['aceptar @usuario']
handler.tags = ['fun']
handler.command = /^aceptar$/i

export default handler
