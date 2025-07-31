import fetch from 'node-fetch'
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`📹 *Debes escribir el nombre del video o pegar un enlace de YouTube.*\n\nEjemplo:\n${usedPrefix + command} linkin park numb`, m)
  }

  try {
    const match = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\\?v=|embed\\/))([\\w-]{11})/)
    let video

    if (match) {
      const videoId = match[1]
      const results = await yts({ videoId })
      video = results.video
    } else {
      const search = await yts(text)
      video = search.videos[0]
    }

    if (!video) return m.reply('❌ No se encontró ningún video.')

    const url = video.url
    let downloadUrl = null

    // --- Primer intento: Neoxr API ---
    try {
      const api1 = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=480p&apikey=GataDios`)
      const json1 = await api1.json()
      downloadUrl = json1?.data?.url
    } catch (e) {
      console.warn('⚠️ Neoxr API falló, intentando fallback...')
    }

    // --- Segundo intento: Vreden API (fallback) ---
    if (!downloadUrl) {
      try {
        const api2 = await fetch(`https://api.vreden.my.id/api/ytmp4?url=${url}`)
        const json2 = await api2.json()
        downloadUrl = json2?.result?.download?.url
      } catch (e) {
        console.warn('⚠️ Fallback Vreden API también falló')
      }
    }

    if (!downloadUrl) {
      throw new Error('No se pudo obtener ningún enlace válido.')
    }

    await conn.sendFile(
      m.chat,
      downloadUrl,
      `${video.title}.mp4`,
      `🎬 *${video.title}*\n📺 Canal: ${video.author.name}\n⏱️ Duración: ${video.timestamp}\n👁️ Vistas: ${video.views.toLocaleString()}`,
      m
    )
  } catch (e) {
    console.error(e)
    m.reply(`✦ No se pudo enviar el video. Esto puede deberse a que el archivo es demasiado pesado o a un error en la generación de la URL. Por favor, intenta nuevamente más tarde.`)
  }
}

handler.command = ['play2']
handler.help = ['play2 <texto|enlace>']
handler.tags = ['descargas']

export default handler
