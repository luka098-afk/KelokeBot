// plugins/video.js
import ytdl from 'ytdl-core'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*🎥 Ingresa el nombre o enlace del video*\n\nEjemplo: ${usedPrefix + command} linkin park numb`)
  }

  try {
    let video
    if (ytdl.validateURL(text)) {
      const info = await ytdl.getInfo(text)
      video = {
        title: info.videoDetails.title,
        url: info.videoDetails.video_url,
        duration: parseInt(info.videoDetails.lengthSeconds)
      }
    } else {
      const search = await yts(text)
      const result = search.videos[0]
      if (!result) return m.reply('✦ No se encontraron resultados.')
      video = {
        title: result.title,
        url: result.url,
        duration: result.seconds
      }
    }

    if (video.duration > 600) {
      return m.reply('✦ El video es muy largo (más de 10 minutos). Intenta con uno más corto.')
    }

    const filePath = path.resolve(`tmp/${Date.now()}.mp4`)
    const stream = ytdl(video.url, { quality: '18' }) // 360p mp4
    const writeStream = fs.createWriteStream(filePath)

    stream.pipe(writeStream)

    writeStream.on('finish', async () => {
      await conn.sendFile(m.chat, filePath, `${video.title}.mp4`, '', m)
      fs.unlinkSync(filePath)
    })

    writeStream.on('error', (err) => {
      console.error(err)
      m.reply('✦ Ocurrió un error al guardar el video.')
    })

    m.reply(`🎬 Descargando: *${video.title}*\nEspere un momento...`)

  } catch (e) {
    console.error(e)
    m.reply('✦ No se pudo enviar el video. Esto puede deberse a que el archivo es demasiado pesado o a un error en la descarga.')
  }
}

handler.command = ['video']
handler.help = ['video']
handler.tags = ['descargas']

export default handler
