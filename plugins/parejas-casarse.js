import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  const parejasPath = path.join('./database', 'parejas.json')
  const casadosPath = path.join('./database', 'casados.json')

  const parejas = fs.existsSync(parejasPath) ? JSON.parse(fs.readFileSync(parejasPath)) : {}
  const casados = fs.existsSync(casadosPath) ? JSON.parse(fs.readFileSync(casadosPath)) : {}

  const user = m.sender
  const userRaw = user.split('@')[0]
  const parejaJid = parejas[user]?.pareja
  if (!parejaJid) return conn.reply(m.chat, `💔 No tienes pareja registrada. Usa *.mipareja* para verla.`, m)
  const parejaRaw = parejaJid.split('@')[0]

  const desde = new Date(parejas[user].desde)
  const dias = Math.floor((Date.now() - desde.getTime()) / (1000*60*60*24))
  if (dias < 4) return conn.reply(m.chat, `⌛ Aún no han estado 4 días juntos como pareja. Llevan ${dias} días 💕`, m)

  // Preparar datos para guardar en casados.json
  const nuevaPropuesta = {
    jid: user,
    targetJid: parejaJid,
    nombre: conn.getName(user) || userRaw,
    targetNombre: conn.getName(parejaJid) || parejaRaw,
    numero: userRaw,
    targetNumero: parejaRaw,
    isGroup: m.isGroup || m.chat.endsWith('@g.us'),
    chatContext: m.chat,
    fecha: new Date().toISOString(),
    estado: 'pendiente' // pendiente hasta que la otra persona diga .si
  }

  // Guardar en un array en la clave del destinatario
  if (!casados[parejaJid]) casados[parejaJid] = []
  casados[parejaJid].push(nuevaPropuesta)

  fs.writeFileSync(casadosPath, JSON.stringify(casados, null, 2))

  const mensaje = `
💌 *Propuesta de Matrimonio* 💌

@${userRaw} se quiere casar con @${parejaRaw} ❤️

✨ Responde con *.si* para aceptar
💔 o con *.no* para rechazar

🌹 Solo @${parejaRaw} puede aceptar o rechazar esta propuesta 🌹
`

  await conn.sendMessage(m.chat, { text: mensaje, mentions: [user, parejaJid] })
}

handler.command = /^casarse$/i
export default handler
