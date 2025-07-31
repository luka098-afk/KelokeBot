// plugins/video.js - REPARACIÓN SIMPLE SIN CAMBIAR PACKAGE.JSON
import ytdl from 'ytdl-core'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `❌ *Uso incorrecto*\n\nEjemplo: ${usedPrefix + command} Bad Bunny`, m)
  }

  const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  
  try {
    let videoUrl = text
    let searchResult

    // Si no es una URL, buscar en YouTube
    if (!isUrl) {
      await conn.reply(m.chat, '🔍 *Buscando video...*', m)
      
      const search = await yts(text)
      if (!search.videos.length) {
        return conn.reply(m.chat, '❌ No se encontraron resultados', m)
      }
      
      searchResult = search.videos[0]
      videoUrl = searchResult.url
    }

    // CONFIGURACIÓN ANTI-410: User-Agent y headers actualizados
    const requestOptions = {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      }
    }

    // Obtener información con configuración anti-bloqueo
    let info
    try {
      info = await ytdl.getInfo(videoUrl, requestOptions)
    } catch (error) {
      console.error('Error al obtener info:', error)
      
      // Intentar método alternativo con delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      try {
        info = await ytdl.getInfo(videoUrl, {
          ...requestOptions,
          requestOptions: {
            ...requestOptions.requestOptions,
            transform: (chunk) => chunk
          }
        })
      } catch (secondError) {
        return conn.reply(m.chat, '❌ Video no disponible o restringido\n\nIntenta con otro video', m)
      }
    }

    const title = info.videoDetails.title
    const duration = parseInt(info.videoDetails.lengthSeconds)
    const author = info.videoDetails.author.name
    const views = info.videoDetails.viewCount
    const thumbnail = info.videoDetails.thumbnails[0]?.url

    // Verificar duración (máximo 10 minutos)
    if (duration > 600) {
      return conn.reply(m.chat, `❌ Video demasiado largo: ${Math.floor(duration / 60)} minutos\nMáximo: 10 minutos`, m)
    }

    // Mostrar información
    const infoText = `📹 *Video encontrado*\n\n` +
                     `📝 ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}\n` +
                     `👤 ${author}\n` +
                     `⏱️ ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}\n` +
                     `👀 ${parseInt(views).toLocaleString()}\n\n` +
                     `⬇️ *Descargando...*`

    await conn.sendMessage(m.chat, {
      text: infoText,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: `${author} • ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
          thumbnailUrl: thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // Crear directorio temporal
    const tempDir = './temp'
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const cleanTitle = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 40)
    const filename = `${cleanTitle}_${Date.now()}.mp4`
    const filepath = path.join(tempDir, filename)

    // CONFIGURACIÓN DE DESCARGA ANTI-410
    const downloadOptions = {
      quality: 'lowest', // Calidad más baja para evitar problemas
      filter: format => {
        return format.container === 'mp4' && 
               format.hasVideo && 
               format.hasAudio &&
               format.contentLength // Solo formatos con tamaño conocido
      },
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Referer': 'https://www.youtube.com/',
          'Origin': 'https://www.youtube.com'
        },
        timeout: 30000 // 30 segundos timeout
      }
    }

    try {
      // Crear stream con configuración anti-bloqueo
      const video = ytdl(videoUrl, downloadOptions)
      const writeStream = fs.createWriteStream(filepath)

      // Manejar errores del stream
      video.on('error', (error) => {
        console.error('Error en stream de video:', error)
        writeStream.destroy()
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
        }
      })

      writeStream.on('error', (error) => {
        console.error('Error en writeStream:', error)
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
        }
      })

      // Descargar con timeout
      await Promise.race([
        new Promise((resolve, reject) => {
          video.pipe(writeStream)
          writeStream.on('finish', resolve)
          video.on('error', reject)
          writeStream.on('error', reject)
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de descarga')), 120000) // 2 minutos
        )
      ])

      // Verificar archivo
      const stats = fs.statSync(filepath)
      if (stats.size === 0) {
        fs.unlinkSync(filepath)
        throw new Error('Archivo vacío')
      }

      // Verificar tamaño máximo (100MB)
      const maxSize = 100 * 1024 * 1024
      if (stats.size > maxSize) {
        fs.unlinkSync(filepath)
        return conn.reply(m.chat, `❌ Video muy grande: ${(stats.size / 1024 / 1024).toFixed(1)}MB\nMáximo: 100MB`, m)
      }

      // Enviar video
      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(filepath),
        caption: `✅ *Descarga completada*\n\n📝 ${title}\n👤 ${author}`,
        mimetype: 'video/mp4'
      }, { quoted: m })

      // Limpiar archivo
      fs.unlinkSync(filepath)

    } catch (downloadError) {
      console.error('Error en descarga:', downloadError)
      
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }

      // Mensajes de error específicos
      if (downloadError.message.includes('410') || downloadError.message.includes('403')) {
        return conn.reply(m.chat, 
          '❌ *YouTube bloqueó la descarga*\n\n' +
          '🔄 *Soluciones:*\n' +
          '• Espera 5-10 minutos\n' +
          '• Intenta con otro video\n' +
          '• El video puede estar restringido', m)
      } else if (downloadError.message.includes('Timeout')) {
        return conn.reply(m.chat, '❌ *Timeout de descarga*\n\nEl video tardó demasiado en descargar', m)
      } else {
        return conn.reply(m.chat, `❌ *Error de descarga*\n\n${downloadError.message}`, m)
      }
    }

  } catch (error) {
    console.error('Error general:', error)
    return conn.reply(m.chat, `❌ Error: ${error.message}`, m)
  }
}

handler.help = ['video'].map(v => v + ' <búsqueda/url>')
handler.tags = ['downloader']
handler.command = ['video', 'ytmp4', 'ytvideo']
handler.register = true
handler.limit = 3

export default handler
