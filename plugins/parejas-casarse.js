import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  const parejasPath = path.join('./database', 'parejas.json')
  const casadosPath = path.join('./database', 'casados.json')

  const parejas = fs.existsSync(parejasPath) ? JSON.parse(fs.readFileSync(parejasPath)) : {}
  const casados = fs.existsSync(casadosPath) ? JSON.parse(fs.readFileSync(casadosPath)) : {}

  const user = m.sender
  const userRaw = user.split('@')[0]
  const parejaJid = parejas[user]?.pareja

  if (!parejaJid) {
    return conn.reply(m.chat, `💔 No tienes pareja registrada. Usa *.mipareja* para verla.`, m)
  }

  const parejaRaw = parejaJid.split('@')[0]

  // 🔎 Verificar si ya está casado cualquiera de los dos
  let yaCasado = false
  for (const [key, propuestas] of Object.entries(casados)) {
    if (propuestas.some(p => p.jid === user || p.targetJid === user || p.jid === parejaJid || p.targetJid === parejaJid)) {
      yaCasado = true
      break
    }
  }

  if (yaCasado) {
    return conn.reply(m.chat, `❌ No puedes casarte porque ya lo estás.`, m)
  }

  // Verificar si existe la fecha de inicio en parejas.json
  const fechaInicio = parejas[user]?.desde || null
  if (!fechaInicio) {
    return conn.reply(m.chat, `❌ No se encontró la fecha de inicio de la relación.`, m)
  }

  // Calcular diferencia en días
  const inicio = new Date(fechaInicio)
  const ahora = new Date()
  const diferenciaDias = Math.floor((ahora - inicio) / (1000 * 60 * 60 * 24))

  if (diferenciaDias < 4) {
    return conn.reply(
      m.chat,
      `⏳ Para poder casarse deben llevar al menos *4 días* de novios.\n\n` +
      `Actualmente llevan: *${diferenciaDias} día${diferenciaDias !== 1 ? 's' : ''}* 💕`,
      m
    )
  }

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

  if (!casados[parejaJid]) casados[parejaJid] = []
  casados[parejaJid].push(nuevaPropuesta)
  fs.writeFileSync(casadosPath, JSON.stringify(casados, null, 2))

  const mensaje = `
╔═━━━✦•💖•✦━━━═╗
      💌  P R O P U E S T A  💌
╚═━━━✦•💖•✦━━━═╝

🌸 @${userRaw} desea casarse con @${parejaRaw} 🌸

✨ Una unión que puede ser eterna ✨
💞 Que los astros y el destino guíen su amor 💞

─────────✧─────────

💍 Responde con *.si* para aceptar
💔 o con *.no* para rechazar

🌹 Solo @${parejaRaw} puede aceptar o rechazar esta propuesta 🌹
`

  await conn.sendMessage(m.chat, { text: mensaje, mentions: [user, parejaJid] })
}

handler.command = /^casarse$/i
export default handler
