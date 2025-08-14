import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const yoJid = m.sender
    const yoRaw = yoJid.split('@')[0]

    const parejasPath = path.join('./database', 'parejas.json')
    const exparejasPath = path.join('./database', 'exparejas.json')

    if (!fs.existsSync(parejasPath)) return m.reply('❌ No tienes pareja actualmente.')

    const parejas = JSON.parse(fs.readFileSync(parejasPath))
    const exparejas = fs.existsSync(exparejasPath) ? JSON.parse(fs.readFileSync(exparejasPath)) : {}

    // Pareja actual
    const parejaData = parejas[yoJid] || parejas[yoRaw]
    if (!parejaData || !parejaData.pareja) {
      return m.reply('❌ No tienes pareja actualmente.')
    }

    const parejaJid = parejaData.pareja
    const parejaRaw = parejaJid.split('@')[0]
    const fechaInicio = new Date(parejaData.desde)
    const casados = parejaData.casados || false

    // Calcular tiempo juntos
    const ahora = new Date()
    const diff = ahora - fechaInicio
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    // Contar exs correctamente sin duplicados
    const exSet = new Set()
    for (const key in exparejas) {
      const registro = exparejas[key]
      if (key === yoJid) {
        exSet.add(registro.ex) // tu ex
      } else if (registro.ex === yoJid) {
        exSet.add(key) // tu ex también registrado al revés
      }
    }

    const exCount = exSet.size

    // Normalizar JIDs
    const userClean = yoJid.includes('@') ? yoJid : `${yoRaw}@s.whatsapp.net`
    const parejaClean = parejaJid.includes('@') ? parejaJid : `${parejaRaw}@s.whatsapp.net`

    const mensaje = `💌 *Declaración Oficial del Amor* 💌

@${yoRaw} está en pareja con @${parejaRaw} ✨

📅 *Día ${dias + 1} de esta bella unión...*

🌟 𓂃 𝓛𝓸𝓼 𝓮𝓼𝓽𝓻𝓮𝓵𝓵𝓸𝓼 𝓼𝓮 𝓪𝓵𝓲𝓷𝓮𝓪𝓻𝓸𝓷... 💞
───────✧───────
        💘  💫  💘
      *Amor eterno confirmado*

*⏳ Tiempo juntos:*
${dias} días, ${horas} horas, ${minutos} minutos

*💍 Casados:* ${casados ? '✅ Sí' : '❌ No'}

*💔 Amores pasados:* ${exCount}`

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [userClean, parejaClean]
    })

  } catch (error) {
    console.error('❌ Error en .mipareja:', error)
    m.reply('❌ Ocurrió un error al consultar tu pareja.')
  }
}

handler.help = ['mipareja']
handler.tags = ['pareja']
handler.command = /^mipareja$/i

export default handler
