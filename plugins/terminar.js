import fs from 'fs'

const handler = async (m, { conn, plugins }) => {
  const parejasFile = './database/parejas.json'
  const exparejasFile = './database/exparejas.json'
  let parejas = {}
  let exparejas = {}

  if (fs.existsSync(parejasFile)) {
    parejas = JSON.parse(fs.readFileSync(parejasFile))
  }

  if (fs.existsSync(exparejasFile)) {
    exparejas = JSON.parse(fs.readFileSync(exparejasFile))
  }

  const senderId = m.sender.replace(/@.+/, '') + '@s.whatsapp.net'
  const parejaData = parejas[senderId]

  if (!parejaData || !parejaData.pareja) {
    return m.reply('❌ No tienes pareja actualmente.')
  }

  const parejaId = parejaData.pareja

  // Guardar la pareja terminada en exparejas con fecha actual
  exparejas[senderId] = {
    ex: parejaId,
    fecha: new Date().toISOString()
  }
  exparejas[parejaId] = {
    ex: senderId,
    fecha: new Date().toISOString()
  }

  // Eliminar la pareja actual
  delete parejas[senderId]
  delete parejas[parejaId]

  fs.writeFileSync(parejasFile, JSON.stringify(parejas, null, 2))
  fs.writeFileSync(exparejasFile, JSON.stringify(exparejas, null, 2))

  // Mensaje simple sin mencionar números raros
  await m.reply(`💔 Has terminado tu relación. Lo sentimos mucho... 😢`)

  // Llamar comando .ex para mostrar ex parejas (si está cargado)
  if (plugins && plugins.ex) {
    plugins.ex.handler(m, { conn, plugins })
  }
}

handler.help = ['terminar']
handler.tags = ['fun']
handler.command = /^terminar$/i

export default handler
