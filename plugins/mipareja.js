import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const userRaw = m.sender.split('@')[0]
    const user = `${userRaw}@s.whatsapp.net`

    // Leer base de datos de parejas
    const parejasPath = path.join('./database', 'parejas.json')
    if (!fs.existsSync(parejasPath)) return m.reply('❌ No tienes pareja actualmente.')

    const parejas = JSON.parse(fs.readFileSync(parejasPath))

    if (!parejas[userRaw]) return m.reply('❌ No tienes pareja actualmente.')

    const parejaObj = parejas[userRaw]
    const parejaJid = parejaObj.pareja
    const fechaInicio = new Date(parejaObj.desde)
    const casados = parejaObj.casados || false
    const parejasAnteriores = parejaObj.parejasAnteriores || 0

    // Calcular tiempo de relación
    const ahora = new Date()
    const diferencia = ahora - fechaInicio

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))

    // Limpiar JIDs para menciones
    const parejaClean = parejaJid.includes('@') ? parejaJid : `${parejaJid}@s.whatsapp.net`
    const userClean = user.includes('@') ? user : `${user}@s.whatsapp.net`
    const userNum = userClean.split('@')[0]
    const parejaNum = parejaClean.split('@')[0]

    // Mensaje con arte y estilo nuevo
    const mensaje = `💫 *Vínculo de Estrellas* 💫

@${userNum} está en una conexión cósmica con @${parejaNum} ✨

🌌 𓂃𓈒𓏸 𝒜𝓂𝑜𝓇 𝑒𝓃 𝓁𝒾𝓃𝑒𝒶... 💞
───☆────☆────☆───
          💫   💞   💫
       *Un amor fuera de este mundo*

*⏳ Tiempo juntos:*
${dias} días, ${horas} horas, ${minutos} minutos

*🔗 Unidos en matrimonio:* ${casados ? '💍 Sí' : '❌ No'}

*🕰️ Amores pasados:* ${parejasAnteriores}`

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [userClean, parejaClean]
    })

  } catch (error) {
    console.error('Error en .mipareja:', error)
    m.reply('❌ Ocurrió un error al consultar tu pareja.')
  }
}

handler.help = ['mipareja']
handler.tags = ['pareja']
handler.command = /^mipareja$/i

export default handler
