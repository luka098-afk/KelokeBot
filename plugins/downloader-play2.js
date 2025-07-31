import fetch from 'node-fetch'
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`📹 *Debes escribir el nombre del video o pegar un enlace de YouTube.*\n\nEjemplo:\n${usedPrefix + command} linkin park numb`, m)
  }

  try {
    // Buscar en YouTube
    const match = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/)
    let video

    if (match) {
      // Si es URL directa
      const videoId = match[1]
      const results = await yts({ videoId })
      video = results.video
    } else {
      // Si es texto, buscar
      const search = await yts(text)
      video = search.videos[0]
    }

    if (!video) return m.reply('❌ No se encontró ningún video.')

    const api = await fetch(`https://api.neoxr.eu/api/youtube?url=${video.url}&type=video&quality=480p&apikey=GataDios`)
    const json = await api.json()

    if (!json || !json.data || !json.data.url) {
      throw new Error('❌ No se pudo obtener el enlace del video.')
    }

    await conn.sendFile(
      m.chat,
      json.data.url,
      `${video.title}.mp4`,
      `🎬 *${video.title}*\n📺 Canal: ${video.author.name}\n⏱️ Duración: ${video.timestamp}\n👁️ Vistas: ${video.views.toLocaleString()}`,
      m
    )
  } catch (e) {
    console.error(e)
    m.reply('⚠️ No se pudo descargar el video. Intenta con otro título o enlace.')
  }
}

handler.command = ['play2']
handler.help = ['play2 <texto|enlace>']
handler.tags = ['descargas']

export default handler
