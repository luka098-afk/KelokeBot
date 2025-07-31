import fetch from 'node-fetch'
import yts from 'yt-search'

const MAX_DURATION_MINUTES = 10
const MAX_FILE_SIZE_MB = 100

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`📹 *Debes escribir el nombre del video o pegar un enlace de YouTube.*\n\nEjemplo:\n${usedPrefix + command} linkin park numb`, m)
  }

  try {
    // Buscar video
    const match = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/)
    let video

    if (match) {
      const videoId = match[1]
      const result = await yts({ videoId })
      video = result.video
    } else {
      const search = await yts(text)
      video = search.videos[0]
    }

    if (!video) return m.reply('❌ No se encontró ningún video.')

    const url = video.url
    const durationSeconds = video.seconds
    const durationMinutes = durationSeconds / 60

    let downloadUrl = null
    let fileSizeMB = null

    // Intentar con API de Vreden
    try {
      const api = await fetch(`https://api.vreden.my.id/api/ytmp4?url=${url}`)
      const json = await api.json()

      downloadUrl = json?.result?.download?.url
      const fileSizeStr = json?.result?.download?.size?.toLowerCase()?.replace('mb', '')
      fileSizeMB = parseFloat(fileSizeStr)
    } catch (e) {
      console.warn('⚠️ Falló la API de Vreden')
    }

    if (!downloadUrl) throw new Error('No se pudo generar una URL válida para el video.')

    // Reglas según duración y peso
    if (durationMinutes > MAX_DURATION_MINUTES && fileSizeMB && fileSizeMB > MAX_FILE_SIZE_MB) {
      return m.reply(`⚠️ *El video dura más de 10 minutos y pesa más de ${MAX_FILE_SIZE_MB} MB.*\nNo se puede enviar por limitaciones de WhatsApp.`)
    }

    await conn.sendFile(
      m.chat,
      downloadUrl,
      `${video.title}.mp4`,
      `🎬 *${video.title}*\n📺 Canal: ${video.author.name}\n⏱️ Duración: ${video.timestamp}\n📦 Tamaño: ${fileSizeMB ? fileSizeMB + ' MB' : 'desconocido'}`,
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
