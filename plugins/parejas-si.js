import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  const casadosPath = path.join('./database', 'casados.json')
  if (!fs.existsSync(casadosPath)) return m.reply('❌ No hay propuestas pendientes.')

  const casados = JSON.parse(fs.readFileSync(casadosPath))

  const user = m.sender       // quien pone .si
  const userRaw = user.split('@')[0]

  // Buscar si hay alguna propuesta pendiente para este usuario
  const propuestas = casados[user] || []
  const propuestaPendiente = propuestas.find(p => p.estado === 'pendiente')

  if (!propuestaPendiente) {
    return m.reply('❌ No tienes ninguna propuesta de matrimonio pendiente.')
  }

  const { jid: solicitante, targetJid, nombre, targetNombre } = propuestaPendiente

  if (solicitante === user) {
    return m.reply('⚠️ Solo la persona invitada puede aceptar esta propuesta.')
  }

  // Marcar como casados eliminando el estado pendiente
  propuestaPendiente.estado = 'casados'

  // Guardar de nuevo
  fs.writeFileSync(casadosPath, JSON.stringify(casados, null, 2))

  const solicitanteRaw = solicitante.split('@')[0]
  const mensaje = `
💍 *¡Felicidades! Ahora están casados* 💍

@${solicitanteRaw} ❤️ @${userRaw}

🌹 _"Dos almas que se encontraron y decidieron caminar juntas para siempre.  
Que este amor sea eterno y lleno de felicidad."_ 🌹

✨ Que su vida juntos esté llena de amor y alegría ✨
`

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [solicitante, user]
  })
}

handler.command = /^si$/i
export default handler
