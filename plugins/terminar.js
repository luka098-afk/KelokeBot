import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, plugins }) => {
  try {
    const parejasPath = path.join('./database', 'parejas.json')
    const exparejasPath = path.join('./database', 'exparejas.json')

    let parejas = {}
    let exparejas = {}

    // Leer archivos existentes
    try {
      if (fs.existsSync(parejasPath)) {
        parejas = JSON.parse(fs.readFileSync(parejasPath))
      }
    } catch (e) {
      parejas = {}
    }

    try {
      if (fs.existsSync(exparejasPath)) {
        exparejas = JSON.parse(fs.readFileSync(exparejasPath))
      }
    } catch (e) {
      exparejas = {}
    }

    // DEBUG: Mostrar información completa
    console.log('=== DEBUG TERMINAR ===')
    console.log('Sender original:', m.sender)
    
    // Probar diferentes formatos de JID
    const senderRaw = m.sender.split('@')[0]
    const senderJID = `${senderRaw}@s.whatsapp.net`
    const senderOriginal = m.sender
    
    console.log('Sender raw:', senderRaw)
    console.log('Sender JID construido:', senderJID)
    console.log('Sender original:', senderOriginal)
    
    // DEBUG: Mostrar contenido de parejas
    console.log('Contenido completo de parejas.json:')
    console.log(JSON.stringify(parejas, null, 2))
    
    console.log('Claves en parejas:', Object.keys(parejas))
    
    // Verificar en todos los formatos posibles
    const posiblesClaves = [senderOriginal, senderJID, senderRaw]
    console.log('Buscando con claves:', posiblesClaves)
    
    let parejaData = null
    let claveEncontrada = null
    
    for (let clave of posiblesClaves) {
      console.log(`Buscando con clave: ${clave}`)
      if (parejas[clave]) {
        parejaData = parejas[clave]
        claveEncontrada = clave
        console.log(`✅ Encontrado con clave: ${clave}`)
        console.log('Datos encontrados:', JSON.stringify(parejaData, null, 2))
        break
      }
    }

    // Si no encontró con las claves directas, buscar en los valores
    if (!parejaData) {
      console.log('No encontrado directamente, buscando en valores...')
      for (let [key, value] of Object.entries(parejas)) {
        console.log(`Verificando entrada: ${key} -> ${JSON.stringify(value)}`)
        if (value.pareja && (
          value.pareja === senderOriginal || 
          value.pareja === senderJID || 
          value.pareja.split('@')[0] === senderRaw
        )) {
          parejaData = value
          claveEncontrada = key
          console.log(`✅ Encontrado como pareja de: ${key}`)
          break
        }
      }
    }

    if (!parejaData || !parejaData.pareja) {
      console.log('❌ No se encontró pareja para:', senderOriginal)
      return m.reply(`❌ No tienes pareja actualmente para terminar una relación.
      
🔍 **Debug info:**
• Tu JID: ${senderOriginal}
• Parejas registradas: ${Object.keys(parejas).length}
• Claves buscadas: ${posiblesClaves.join(', ')}

📝 Si crees que esto es un error, contacta al desarrollador.`)
    }

    console.log('✅ Pareja encontrada:', parejaData)

    const parejaJID = parejaData.pareja
    const parejaRaw = parejaJID.split('@')[0]
    const senderName = conn.getName(senderOriginal) || senderRaw
    const parejaName = conn.getName(parejaJID) || parejaRaw

    // Guardar la relación terminada en exparejas
    exparejas[senderOriginal] = {
      ex: parejaJID,
      exNombre: parejaName,
      miNombre: senderName,
      fecha: new Date().toISOString()
    }

    exparejas[parejaJID] = {
      ex: senderOriginal,
      exNombre: senderName,
      miNombre: parejaName,
      fecha: new Date().toISOString()
    }

    // Eliminar la pareja actual (usar la clave que se encontró)
    if (claveEncontrada) {
      delete parejas[claveEncontrada]
    }
    delete parejas[parejaJID]
    delete parejas[senderOriginal]
    delete parejas[senderJID]

    // Guardar cambios
    fs.writeFileSync(parejasPath, JSON.stringify(parejas, null, 2))
    fs.writeFileSync(exparejasPath, JSON.stringify(exparejas, null, 2))

    // Poemas aleatorios para la ruptura
    const poemas = [
      `💔 *Adiós a nuestro amor* 💔

"Como flores que se marchitan al final del verano,
nuestro amor llegó a su destino.
Guardemos los buenos momentos en el corazón,
y sigamos cada uno nuestro camino."

🥀 A veces terminar es también un acto de amor... 🥀`,

      `💔 *El final de una historia* 💔

"No todas las historias tienen final feliz,
pero todas dejan una enseñanza.
Gracias por los momentos compartidos,
ahora cada uno busca nueva esperanza."

🌙 Que la luna sea testigo de que fuimos felices... 🌙`,

      `💔 *Libertad para ambos* 💔

"Como pájaros que vuelan en distinta dirección,
nuestros corazones buscan nuevo horizonte.
No hay rencor, solo la comprensión
de que a veces amar es soltar el puente."

🕊️ Que encuentres la felicidad que mereces... 🕊️`,

      `💔 *Despedida con gratitud* 💔

"Cerramos este capítulo con dignidad,
llevando en el alma lo vivido.
Cada beso, cada abrazo fue verdad,
ahora cada uno sigue su latido."

✨ Gracias por haber sido parte de mi historia... ✨`
    ]

    const poemaAleatorio = poemas[Math.floor(Math.random() * poemas.length)]

    // Limpiar JIDs para las menciones
    const senderClean = senderOriginal.includes('@') ? senderOriginal : `${senderOriginal}@s.whatsapp.net`
    const parejaClean = parejaJID.includes('@') ? parejaJID : `${parejaJID}@s.whatsapp.net`

    // Extraer números limpios para el texto
    const senderNum = senderClean.split('@')[0]
    const parejaNum = parejaClean.split('@')[0]

    const mensaje = `${poemaAleatorio}

💔 @${senderNum} y @${parejaNum} han terminado su relación 💔

*Los recuerdos quedan, pero cada uno toma su propio sendero...*

😢 Esperamos que ambos encuentren la felicidad que buscan 😢`

    // Enviar mensaje con menciones
    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [senderClean, parejaClean]
    })

    // Llamar comando .ex para mostrar ex parejas (si está disponible)
    if (plugins && plugins.ex && typeof plugins.ex.handler === 'function') {
      try {
        await plugins.ex.handler(m, { conn, plugins })
      } catch (error) {
        console.log('No se pudo ejecutar el comando .ex:', error.message)
      }
    }

  } catch (error) {
    console.error('Error en comando .terminar:', error)
    m.reply('❌ Ocurrió un error al terminar la relación. Inténtalo de nuevo.')
  }
}

handler.help = ['terminar']
handler.tags = ['pareja']
handler.command = /^terminar$/i

export default handler
