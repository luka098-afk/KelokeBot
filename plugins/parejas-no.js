import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  const casadosPath = path.join('./database', 'casados.json')
  if (!fs.existsSync(casadosPath)) return m.reply('❌ No hay propuestas pendientes.')

  const casados = JSON.parse(fs.readFileSync(casadosPath))

  const user = m.sender       // quien pone .no
  const userRaw = user.split('@')[0]

  // Buscar si hay alguna propuesta pendiente para este usuario
  const propuestas = casados[user] || []
  const propuestaPendienteIndex = propuestas.findIndex(p => p.estado === 'pendiente')

  if (propuestaPendienteIndex === -1) {
    return m.reply('❌ No tienes ninguna propuesta de matrimonio pendiente.')
  }

  const propuestaPendiente = propuestas[propuestaPendienteIndex]
  const { jid: solicitante } = propuestaPendiente
  const solicitanteRaw = solicitante.split('@')[0]

  if (solicitante === user) {
    return m.reply('⚠️ Solo la persona invitada puede rechazar esta propuesta.')
  }

  // Eliminar la propuesta pendiente
  propuestas.splice(propuestaPendienteIndex, 1)
  if (propuestas.length === 0) {
    delete casados[user]
  } else {
    casados[user] = propuestas
  }

  fs.writeFileSync(casadosPath, JSON.stringify(casados, null, 2))

  const mensaje = `
💔 *Propuesta de matrimonio rechazada* 💔

@${userRaw} ha decidido no aceptar la propuesta de @${solicitanteRaw}.

📜 _"El amor no siempre llega en el momento esperado,  
pero cada corazón encontrará su camino."_ 💔

😔 Que el verdadero amor llegue cuando menos lo esperen.  
`

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [user, solicitante]
  })
}

handler.command = /^no$/i
export default handler
