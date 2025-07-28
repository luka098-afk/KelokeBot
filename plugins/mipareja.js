import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const userRaw = m.sender.split('@')[0]
    const userJid = `${userRaw}@s.whatsapp.net`

    const parejasPath = path.join('./database', 'parejas.json')
    if (!fs.existsSync(parejasPath)) return m.reply('❌ No tienes pareja actualmente.')

    const parejas = JSON.parse(fs.readFileSync(parejasPath))
    if (!parejas[userRaw]) return m.reply('❌ No tienes pareja actualmente.')

    const parejaData = parejas[userRaw]
    const parejaJid = parejaData.pareja
    const parejaRaw = parejaJid.split('@')[0]
    const fechaInicio = new Date(parejaData.desde)
    const casados = parejaData.casados || false
    const parejasAnteriores = parejaData.parejasAnteriores || 0

    const ahora = new Date()
    const diff = ahora - fechaInicio

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    const mensaje = `💌 *Declaración Oficial del Amor* 💌

@${userRaw} está en pareja con @${parejaRaw} ✨

📅 *Día ${dias + 1} de esta bella unión...*

🌟 𓂃 𝓛𝓸𝓼 𝓮𝓼𝓽𝓻𝓮𝓵𝓵𝓸𝓼 𝓼𝓮 𝓪𝓵𝓲𝓷𝓮𝓪𝓻𝓸𝓷... 💞
───────✧───────
        💘  💫  💘
      *Amor eterno confirmado*

*⏳ Tiempo juntos:*
${dias} días, ${horas} horas, ${minutos} minutos

*💍 Casados:* ${casados ? '✅ Sí' : '❌ No'}

*💔 Amores pasados:* ${parejasAnteriores}`

    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [userJid, parejaJid]
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
