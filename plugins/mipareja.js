// mipareja.js
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  try {
    const userRaw = m.sender.split('@')[0]
    const user = `${userRaw}@s.whatsapp.net`

    // Leer base de datos de parejas
    const parejasPath = path.join('./database', 'parejas.json')
    let parejas = {}
    try {
      parejas = JSON.parse(fs.readFileSync(parejasPath))
    } catch (e) {
      return m.reply('❌ No tienes pareja actualmente.')
    }

    // Verificar si tiene pareja
    if (!parejas[userRaw]) {
      return m.reply('❌ No tienes pareja actualmente.')
    }

    const pareja = parejas[userRaw]
    const parejaJid = pareja.jid
    const parejaNombre = pareja.pareja
    const fechaInicio = new Date(pareja.fechaInicio)
    const casados = pareja.casados || false
    const parejasAnteriores = pareja.parejasAnteriores || 0

    // Calcular tiempo de relación
    const ahora = new Date()
    const diferencia = ahora - fechaInicio
    
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))

    // Limpiar y normalizar JIDs para menciones
    const userClean = user.includes('@') ? user : `${user}@s.whatsapp.net`
    const parejaClean = parejaJid.includes('@') ? parejaJid : `${parejaJid}@s.whatsapp.net`
    
    const userNum = userClean.split('@')[0]
    const parejaNum = parejaClean.split('@')[0]

    const mensaje = `@${userNum} 𝙴𝚂𝚃𝙰́𝚂 𝙴𝙽 𝚄𝙽𝙰 𝚁𝙴𝙻𝙰𝙲𝙸𝙾́𝙽 𝙲𝙾𝙽 @${parejaNum} 😋

───▄█▀█▄──▄███▄───
──▐█░██████████▌──
───██▒█████████───
────▀████████▀────
───────▀██▀───────
❣️‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎😍 ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎‎ ❣️

*⏳Tiempo de pareja:*
${dias} días, ${horas} horas, ${minutos} minutos

*💍Casados:* ${casados ? '✅' : '❌'}

*💕Parejas anteriores:* ${parejasAnteriores}`

    const mentionsArray = [userClean, parejaClean]

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: mentionsArray
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
