import fetch from "node-fetch"
import yts from 'yt-search'
import axios from "axios"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const fake = {
    quoted: m,
    contextInfo: {
      isForwarded: true,
      forwardingScore: 999
    }
  }

  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `*🎵 Tienes que poner un término de búsqueda*\n\nEjemplo: *${usedPrefix + command}* linkin park lost`, m, fake)
    }

    if (text.includes('@')) {
      return conn.reply(m.chat, `*🎵 Descargando...*\n\n💡 *Tip:* Pon el nombre del artista para una descarga más precisa`, m, fake)
    }

    let videoIdToFind = text.match(youtubeRegexID) || null
    let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1])

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId)
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2
    if (!ytplay2 || ytplay2.length == 0) {
      return m.reply('✧ No se encontraron resultados para tu búsqueda.')
    }

    let { title, thumbnail, url, author } = ytplay2
    title = title || 'no encontrado'
    thumbnail = thumbnail || 'no encontrado'
    url = url || 'no encontrado'
    author = author || 'Desconocido'

    const canal = author.name ? author.name : 'Desconocido'
    const infoMessage = `🎵 ᴅᴇsᴄᴀʀɢᴀɴᴅᴏ... ♪\n\n*${canal} - ${title}*`

    const thumb = (await conn.getFile(thumbnail))?.data
    const JT = {
      contextInfo: {
        externalAdReply: {
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true
        }
      }
    }

    await conn.reply(m.chat, infoMessage, m, JT)

    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      try {
        const api = await (await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)).json()
        const resulta = api.result
        const result = resulta.download.url
        if (!result) throw new Error('✦ El enlace de audio no se generó correctamente.')
        await conn.sendMessage(m.chat, { audio: { url: result }, mimetype: 'audio/mpeg' }, { quoted: m })
      } catch (e) {
        return conn.reply(m.chat, '✦ No se pudo enviar el audio. Esto puede deberse a que el archivo es demasiado pesado o a un error en la generación de la URL. Por favor, intenta nuevamente más tarde.', m)
      }
    } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      try {
        const response = await fetch(`https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=480p&apikey=GataDios`)
        const json = await response.json()
        await conn.sendFile(m.chat, json.data.url, json.title + '.mp4', '', m)
      } catch (e) {
        return conn.reply(m.chat, '✦ No se pudo enviar el video. Esto puede deberse a que el archivo es demasiado pesado o a un error en la generación de la URL. Por favor, intenta nuevamente más tarde.', m)
      }
    } else {
      return conn.reply(m.chat, '✧︎ Comando no reconocido.', m)
    }

  } catch (error) {
    return m.reply(`✦ Ocurrió un error: ${error}`)
  }
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'ytv', 'ytmp4', 'playaudio', 'mp4']
handler.tags = ['descargas']

export default handler
