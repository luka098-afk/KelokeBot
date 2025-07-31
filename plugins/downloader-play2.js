import fetch from 'node-fetch'
import yts from 'yt-search'

const MAX_FILE_SIZE_MB = 100

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`📹 *Escribe el nombre del video o pega un enlace.*\nEjemplo:\n${usedPrefix + command} alone marshmello`, m)

  try {
    const search = await yts(text)
    const video = search.videos[0]
    if (!video) return m.reply('❌ No encontré ningún video.')

    const url = video.url
    const ytapi = await fetch(`https://api.vreden.my.id/api/ytmp4?url=${url}`)
    const json = await ytapi.json()
    const download = json?.result?.download
    const downloadUrl = download?.url
    const fileSize = parseFloat(download?.size?.toLowerCase()?.replace('mb', ''))

    if (!downloadUrl) throw 'No se pudo generar el enlace de descarga.'

    // Si el archivo es menor a 100MB, lo intenta mandar
    if (fileSize && fileSize < MAX_FILE_SIZE_MB) {
      await conn.sendFile(
        m.chat,
        downloadUrl,
        `${video.title}.mp4`,
        `🎬 *${video.title}*\n📺 ${video.author.name}\n⏱️ ${video.timestamp}`,
        m
      )
    } else {
      // Si es más pesado, manda vista previa con botón
      await conn.sendMessage(m.chat, {
        image: { url: video.thumbnail },
        caption: `🎬 *${video.title}*\n⏱️ ${video.timestamp}\n📦 *Archivo demasiado pesado para enviarlo directamente.*`,
        contextInfo: {
          externalAdReply: {
            mediaType: 1,
            previewType: 0,
            mediaUrl: downloadUrl,
            sourceUrl: downloadUrl,
            thumbnail: await (await fetch(video.thumbnail)).buffer(),
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    }
  } catch (e) {
    console.error(e)
    m.reply(`✦ No se pudo enviar el video. Esto puede deberse a que el archivo es demasiado pesado o a un error en la URL. Intenta más tarde.`)
  }
}

handler.command = ['play2']
handler.help = ['play2 <texto|enlace>']
handler.tags = ['descargas']

export default handler
