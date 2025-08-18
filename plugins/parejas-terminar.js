import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, plugins }) => {
  try {
    const parejasPath = path.join('./database', 'parejas.json')
    const exparejasPath = path.join('./database', 'exparejas.json')
    const casadosPath = path.join('./database', 'casados.json') // agregado

    let parejas = fs.existsSync(parejasPath) ? JSON.parse(fs.readFileSync(parejasPath)) : {}
    let exparejas = fs.existsSync(exparejasPath) ? JSON.parse(fs.readFileSync(exparejasPath)) : {}
    let casados = fs.existsSync(casadosPath) ? JSON.parse(fs.readFileSync(casadosPath)) : {}

    const yoJid = m.sender
    const yoRaw = yoJid.split('@')[0]

    // Buscar pareja con clave exacta o solo el número
    const parejaData = parejas[yoJid] || parejas[yoRaw]
    if (!parejaData || !parejaData.pareja) {
      return m.reply('❌ No tienes pareja actualmente para terminar una relación.')
    }

    const parejaJid = parejaData.pareja
    const parejaRaw = parejaJid.split('@')[0]
    const yoName = await conn.getName(yoJid)
    const parejaName = await conn.getName(parejaJid)

    // Guardar relación terminada
    exparejas[yoJid] = {
      ex: parejaJid,
      exNombre: parejaName,
      miNombre: yoName,
      fecha: new Date().toISOString()
    }

    exparejas[parejaJid] = {
      ex: yoJid,
      exNombre: yoName,
      miNombre: parejaName,
      fecha: new Date().toISOString()
    }

    // Eliminar de parejas.json
    delete parejas[yoJid]
    delete parejas[yoRaw]
    delete parejas[parejaJid]
    delete parejas[parejaRaw]

    // Eliminar de casados.json si existía
    if (casados[yoJid]) {
      casados[yoJid] = casados[yoJid].filter(c => c.jid !== parejaJid)
      if (casados[yoJid].length === 0) delete casados[yoJid]
    }
    if (casados[parejaJid]) {
      casados[parejaJid] = casados[parejaJid].filter(c => c.jid !== yoJid)
      if (casados[parejaJid].length === 0) delete casados[parejaJid]
    }

    fs.writeFileSync(parejasPath, JSON.stringify(parejas, null, 2))
    fs.writeFileSync(exparejasPath, JSON.stringify(exparejas, null, 2))
    fs.writeFileSync(casadosPath, JSON.stringify(casados, null, 2))

    // Poemas de ruptura
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

    // Menciones limpias
    const yoClean = yoJid.includes('@') ? yoJid : `${yoRaw}@s.whatsapp.net`
    const parejaClean = parejaJid.includes('@') ? parejaJid : `${parejaRaw}@s.whatsapp.net`

    const mensaje = `${poemaAleatorio}

💔 @${yoRaw} y @${parejaRaw} han terminado su relación 💔

*Los recuerdos quedan, pero cada uno toma su propio sendero...*

😢 Esperamos que ambos encuentren la felicidad que buscan 😢`

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [yoClean, parejaClean]
    })

    // Ejecutar comando .ex si existe
    if (plugins?.ex?.handler) {
      try {
        await plugins.ex.handler(m, { conn, plugins })
      } catch (e) {
        console.log('No se pudo ejecutar el comando .ex:', e.message)
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
