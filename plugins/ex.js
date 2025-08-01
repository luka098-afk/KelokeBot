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

    // Usar la misma lógica de búsqueda que en .terminar
    const senderRaw = m.sender.split('@')[0]
    const senderJID = `${senderRaw}@s.whatsapp.net`
    const senderOriginal = m.sender
    
    // Buscar con múltiples formatos posibles
    const posiblesClaves = [senderOriginal, senderJID, senderRaw]
    
    // Buscar ex parejas
    let misExs = []
    for (let clave of posiblesClaves) {
      if (exparejas[clave]) {
        const exData = exparejas[clave]
        if (exData.ex) {
          const exRaw = exData.ex.split('@')[0]
          const exName = exData.exNombre || conn.getName(exData.ex) || exRaw
          misExs.push({
            jid: exData.ex,
            nombre: exName,
            raw: exRaw
          })
        }
      }
    }

    // Buscar pareja actual
    let parejaActual = null
    let claveEncontrada = null
    
    for (let clave of posiblesClaves) {
      if (parejas[clave]) {
        parejaActual = parejas[clave]
        claveEncontrada = clave
        break
      }
    }

    // Si no encontró directamente, buscar en los valores
    if (!parejaActual) {
      for (let [key, value] of Object.entries(parejas)) {
        if (value.pareja && (
          value.pareja === senderOriginal || 
          value.pareja === senderJID || 
          value.pareja.split('@')[0] === senderRaw
        )) {
          parejaActual = value
          break
        }
      }
    }

    // Construir mensaje
    let texto = ''
    const mentionsArray = []

    // Mostrar ex parejas
    if (misExs.length > 0) {
      texto += `💔 **Exs:** `
      const exNames = []
      
      for (const ex of misExs) {
        exNames.push(`@${ex.raw}`)
        const exClean = ex.jid.includes('@') ? ex.jid : `${ex.jid}@s.whatsapp.net`
        mentionsArray.push(exClean)
      }
      
      texto += exNames.join(', ') + '\n\n'
    }

    // Mostrar pareja actual
    if (parejaActual && parejaActual.pareja) {
      const parejaRaw = parejaActual.pareja.split('@')[0]
      const parejaName = parejaActual.parejaNombre || conn.getName(parejaActual.pareja) || parejaRaw
      
      texto += `💕 **Actual pareja @${parejaRaw}**`
      
      const parejaClean = parejaActual.pareja.includes('@') ? parejaActual.pareja : `${parejaActual.pareja}@s.whatsapp.net`
      mentionsArray.push(parejaClean)
    }

    // Si no hay ni ex ni pareja actual
    if (misExs.length === 0 && !parejaActual) {
      return m.reply('🤷‍♂️ No tienes ex parejas ni pareja actual registradas.')
    }

    // Si solo no hay ex parejas
    if (misExs.length === 0 && parejaActual) {
      const parejaRaw = parejaActual.pareja.split('@')[0]
      texto = `💕 **Actual pareja @${parejaRaw}**\n\n🤷‍♂️ No tienes ex parejas registradas.`
      
      const parejaClean = parejaActual.pareja.includes('@') ? parejaActual.pareja : `${parejaActual.pareja}@s.whatsapp.net`
      mentionsArray.push(parejaClean)
    }

    // Enviar mensaje con menciones
    await conn.sendMessage(m.chat, {
      text: texto,
      mentions: mentionsArray
    })

  } catch (error) {
    console.error('Error en .ex:', error)
    m.reply('❌ Ocurrió un error al consultar tus relaciones.')
  }
}

handler.help = ['ex']
handler.tags = ['fun']
handler.command = /^ex$/i

export default handler
