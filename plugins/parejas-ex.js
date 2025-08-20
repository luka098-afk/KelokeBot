import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  try {
    const exparejasPath = path.join('./database', 'exparejas.json')
    const parejasPath = path.join('./database', 'parejas.json')

    let exparejas = {}
    let parejas = {}

    if (fs.existsSync(exparejasPath)) exparejas = JSON.parse(fs.readFileSync(exparejasPath))
    if (fs.existsSync(parejasPath)) parejas = JSON.parse(fs.readFileSync(parejasPath))

    // Determinar el JID objetivo: citado > mencionado > quien ejecuta
    let targetJID = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]) || m.sender
    const targetNumber = targetJID.split('@')[0]
    const targetName = conn.getName(targetJID) || targetNumber

    // Función para extraer solo el número
    const extractNumber = (jid) => jid.toString().split('@')[0].replace(/\D/g, '')

    const exParejasFound = []
    const parejaActualFound = []

    // === BUSCAR EX PAREJAS ===
    for (const [key, data] of Object.entries(exparejas)) {
      const keyNumber = extractNumber(key)
      if (keyNumber === extractNumber(targetJID) && data?.ex) {
        const exJID = data.ex
        const exNumber = extractNumber(exJID)
        if (exNumber !== extractNumber(targetJID)) exParejasFound.push({ jid: exJID, number: exNumber })
      }
    }

    // === BUSCAR PAREJA ACTUAL ===
    if (parejas[targetJID]?.pareja) {
      const pareja = parejas[targetJID].pareja
      if (extractNumber(pareja) !== extractNumber(targetJID)) parejaActualFound.push({ jid: pareja, number: extractNumber(pareja) })
    } else {
      // Buscar donde el usuario sea valor de "pareja"
      for (const [key, data] of Object.entries(parejas)) {
        if (data?.pareja && extractNumber(data.pareja) === extractNumber(targetJID)) {
          parejaActualFound.push({ jid: key, number: extractNumber(key) })
          break
        }
      }
    }

    // === CONSTRUIR MENSAJE ===
    const mentionsArray = [targetJID]
    let mensaje = `📜 *Exparejas de* @${targetNumber} 📜\n\n`

    if (exParejasFound.length > 0) {
      mensaje += `💔 *Ex parejas:* ${exParejasFound.map(ex => `@${ex.number}`).join(', ')}\n\n`
      exParejasFound.forEach(ex => mentionsArray.push(ex.jid))
    } else {
      mensaje += `💔 *Ex parejas:* Ninguna registrada\n\n`
    }

    if (parejaActualFound.length > 0) {
      mensaje += `💕 *Pareja actual:* @${parejaActualFound[0].number}`
      mentionsArray.push(parejaActualFound[0].jid)
    } else {
      mensaje += `💔 *Pareja actual:* No tiene 💔`
    }

    await conn.sendMessage(m.chat, { text: mensaje, mentions: mentionsArray })

  } catch (error) {
    console.error('❌ Error en .ex:', error)
    m.reply('❌ Ocurrió un error al consultar las relaciones.')
  }
}

handler.help = ['ex [@usuario]']
handler.tags = ['fun']
handler.command = /^ex$/i

export default handler
