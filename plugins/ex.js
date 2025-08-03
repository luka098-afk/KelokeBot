import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const exparejasPath = path.join('./database', 'exparejas.json')
    const parejasPath = path.join('./database', 'parejas.json')

    let exparejas = {}
    let parejas = {}

    // Leer archivos existentes
    try {
      if (fs.existsSync(exparejasPath)) {
        exparejas = JSON.parse(fs.readFileSync(exparejasPath))
      }
    } catch (e) {
      exparejas = {}
    }

    try {
      if (fs.existsSync(parejasPath)) {
        parejas = JSON.parse(fs.readFileSync(parejasPath))
      }
    } catch (e) {
      parejas = {}
    }

    // Obtener información del usuario
    const sender = m.sender // JID completo del usuario
    const senderRaw = sender.split('@')[0] // Solo el número
    const senderJID = `${senderRaw}@s.whatsapp.net` // JID normalizado

    // Posibles claves para buscar
    const posiblesClaves = [sender, senderJID, senderRaw]

    // Buscar ex parejas
    let misExs = []
    for (let clave of posiblesClaves) {
      if (exparejas[clave]) {
        const exData = exparejas[clave]
        if (exData.ex) {
          let exJID = exData.ex
          // Normalizar JID de la ex pareja
          if (!exJID.includes('@')) {
            exJID = `${exJID}@s.whatsapp.net`
          }
          const exRaw = exJID.split('@')[0]
          const exName = exData.exNombre || conn.getName(exJID) || exRaw
          misExs.push({
            jid: exJID,
            nombre: exName,
            raw: exRaw
          })
        }
      }
    }

    // Buscar pareja actual - CORREGIDO: verificar que NO sea el mismo usuario
    let parejaActual = null

    // Primero buscar como clave principal
    for (let clave of posiblesClaves) {
      if (parejas[clave] && parejas[clave].pareja) {
        // Asegurar que la pareja no sea el mismo usuario
        const parejaJID = parejas[clave].pareja
        const parejaRaw = parejaJID.split('@')[0]
        if (parejaRaw !== senderRaw) {
          parejaActual = parejas[clave]
          break
        }
      }
    }

    // Si no encontró directamente, buscar en los valores (donde el usuario es la pareja)
    if (!parejaActual) {
      for (let [key, value] of Object.entries(parejas)) {
        if (value.pareja && (
          value.pareja === sender ||
          value.pareja === senderJID ||
          value.pareja.split('@')[0] === senderRaw
        )) {
          // La pareja actual sería la clave (key), no el valor
          const keyRaw = key.split('@')[0]
          if (keyRaw !== senderRaw) { // Asegurar que no sea el mismo usuario
            parejaActual = {
              pareja: key,
              parejaNombre: value.nombre || conn.getName(key) || keyRaw
            }
            break
          }
        }
      }
    }

    // Construir mensaje
    let texto = ''
    const mentionsArray = []

    // Mostrar ex parejas
    if (misExs.length > 0) {
      texto += `💔 **Ex parejas:** `
      const exNames = []

      for (const ex of misExs) {
        exNames.push(`@${ex.raw}`)
        mentionsArray.push(ex.jid)
      }

      texto += exNames.join(', ') + '\n\n'
    }

    // Mostrar pareja actual
    if (parejaActual && parejaActual.pareja) {
      let parejaJID = parejaActual.pareja
      // Normalizar JID
      if (!parejaJID.includes('@')) {
        parejaJID = `${parejaJID}@s.whatsapp.net`
      }
      const parejaRaw = parejaJID.split('@')[0]
      const parejaName = parejaActual.parejaNombre || conn.getName(parejaJID) || parejaRaw

      texto += `💕 **Pareja actual:** @${parejaRaw}`
      mentionsArray.push(parejaJID)
    } else {
      // Si no tiene pareja actual
      if (misExs.length > 0) {
        texto += `💔 **Pareja actual:** No tiene 💔`
      } else {
        texto += `💔 **Pareja actual:** No tiene 💔`
      }
    }

    // Si no hay ni ex ni pareja actual
    if (misExs.length === 0 && !parejaActual) {
      return m.reply('💔 No tienes ex parejas ni pareja actual registradas. ¡Sal ahí fuera y encuentra el amor! 💕')
    }

    // Si solo no hay ex parejas pero sí tiene pareja
    if (misExs.length === 0 && parejaActual) {
      let parejaJID = parejaActual.pareja
      if (!parejaJID.includes('@')) {
        parejaJID = `${parejaJID}@s.whatsapp.net`
      }
      const parejaRaw = parejaJID.split('@')[0]
      
      texto = `💕 **Pareja actual:** @${parejaRaw}\n\n🤷‍♂️ No tienes ex parejas registradas.`
      mentionsArray.push(parejaJID)
    }

    // Enviar mensaje con menciones
    await conn.sendMessage(m.chat, {
      text: texto,
      mentions: mentionsArray
    })

    console.log(`Consulta .ex de ${senderRaw}:`)
    console.log(`Ex parejas: ${misExs.length}`)
    console.log(`Pareja actual: ${parejaActual ? 'Sí' : 'No'}`)
    console.log(`Menciones enviadas: [${mentionsArray.join(', ')}]`)

  } catch (error) {
    console.error('Error en .ex:', error)
    m.reply('❌ Ocurrió un error al consultar tus relaciones.')
  }
}

handler.help = ['ex']
handler.tags = ['fun']
handler.command = /^ex$/i

export default handler
