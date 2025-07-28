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

    // Obtener el sender limpio y normalizado
    const senderRaw = m.sender.split('@')[0]
    const sender = `${senderRaw}@s.whatsapp.net`
    const senderName = conn.getName(sender) || senderRaw

    // Verificar si tiene pareja actual
    const parejaData = parejas[senderRaw]
    if (!parejaData || !parejaData.pareja) {
      return m.reply('❌ No tienes pareja actualmente para terminar una relación.')
    }

    const parejaRaw = parejaData.pareja.split('@')[0]
    const pareja = `${parejaRaw}@s.whatsapp.net`
    const parejaName = conn.getName(pareja) || parejaRaw

    // Guardar la relación terminada en exparejas con nombres
    exparejas[senderRaw] = {
      ex: parejaData.pareja,
      exNombre: parejaName,
      miNombre: senderName,
      fecha: new Date().toISOString()
    }
    
    exparejas[parejaRaw] = {
      ex: sender,
      exNombre: senderName,
      miNombre: parejaName,
      fecha: new Date().toISOString()
    }

    // Eliminar la pareja actual
    delete parejas[senderRaw]
    delete parejas[parejaRaw]

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

    // Limpiar y normalizar JIDs para las menciones
    const senderClean = sender.includes('@') ? sender : `${sender}@s.whatsapp.net`
    const parejaClean = pareja.includes('@') ? pareja : `${pareja}@s.whatsapp.net`

    const mensaje = `${poemaAleatorio}

💔 @${senderRaw} y @${parejaRaw} han terminado su relación 💔

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
