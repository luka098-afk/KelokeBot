// plugins/video.js
import ytdl from 'ytdl-core'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `❌ *Uso incorrecto*\n\nEjemplo: ${usedPrefix + command} nombre del video o URL`, m)
  }

  const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  
  try {
    let videoUrl = text
    let videoInfo

    // Si no es una URL, buscar en YouTube
    if (!isUrl) {
      await conn.reply(m.chat, '🔍 *Buscando video...*', m)
      
      const search = await yts(text)
      if (!search.videos.length) {
        return conn.reply(m.chat, '❌ No se encontraron resultados para tu búsqueda', m)
      }
      
      videoInfo = search.videos[0]
      videoUrl = videoInfo.url
    } else {
      // Obtener info del video desde la URL
      videoUrl = text
      try {
        videoInfo = await ytdl.getInfo(videoUrl)
      } catch (error) {
        return conn.reply(m.chat, '❌ Error al obtener información del video. Verifica que la URL sea válida.', m)
      }
    }

    // Verificar que el video sea descargable
    if (!ytdl.validateURL(videoUrl)) {
      return conn.reply(m.chat, '❌ URL de YouTube no válida', m)
    }

    // Obtener información del video
    let info
    try {
      info = await ytdl.getInfo(videoUrl)
    } catch (error) {
      console.error('Error al obtener info:', error)
      return conn.reply(m.chat, '❌ Error al procesar el video. Puede que el video sea privado o esté restringido.', m)
    }

    const title = info.videoDetails.title
    const duration = info.videoDetails.lengthSeconds
    const author = info.videoDetails.author.name
    const views = info.videoDetails.viewCount
    const thumbnail = info.videoDetails.thumbnails[0]?.url

    // Verificar duración (máximo 10 minutos para evitar archivos muy grandes)
    if (duration > 600) {
      return conn.reply(m.chat, '❌ El video es demasiado largo (máximo 10 minutos)', m)
    }

    // Mostrar información del video
    const infoText = `📹 *Información del Video*\n\n` +
                     `📝 *Título:* ${title}\n` +
                     `👤 *Canal:* ${author}\n` +
                     `⏱️ *Duración:* ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}\n` +
                     `👀 *Vistas:* ${parseInt(views).toLocaleString()}\n\n` +
                     `⬇️ *Descargando...*`

    await conn.sendMessage(m.chat, {
      text: infoText,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: `Por ${author}`,
          thumbnailUrl: thumbnail,
          sourceUrl: videoUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // Crear directorio temporal si no existe
    const tempDir = './temp'
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Nombre del archivo limpio
    const cleanTitle = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 50)
    const filename = `${cleanTitle}_${Date.now()}.mp4`
    const filepath = path.join(tempDir, filename)

    try {
      // Configurar opciones de descarga
      const downloadOptions = {
        quality: 'lowest', // Para archivos más pequeños
        filter: format => format.container === 'mp4' && format.hasVideo && format.hasAudio,
      }

      // Crear stream de descarga
      const video = ytdl(videoUrl, downloadOptions)
      const writeStream = fs.createWriteStream(filepath)

      // Manejar el progreso de descarga
      let downloadedBytes = 0
      video.on('progress', (chunkLength, downloaded, total) => {
        downloadedBytes = downloaded
        const percent = ((downloaded / total) * 100).toFixed(1)
        if (downloaded % (1024 * 1024 * 5) < chunkLength) { // Actualizar cada 5MB
          console.log(`Descarga: ${percent}%`)
        }
      })

      // Promisificar la descarga
      await new Promise((resolve, reject) => {
        video.pipe(writeStream)
        
        video.on('error', reject)
        writeStream.on('error', reject)
        writeStream.on('finish', resolve)
      })

      // Verificar que el archivo se descargó correctamente
      const stats = fs.statSync(filepath)
      if (stats.size === 0) {
        throw new Error('El archivo descargado está vacío')
      }

      // Verificar tamaño del archivo (máximo 100MB para WhatsApp)
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (stats.size > maxSize) {
        fs.unlinkSync(filepath) // Eliminar archivo
        return conn.reply(m.chat, '❌ El video es demasiado grande para enviarlo (máximo 100MB)', m)
      }

      // Enviar el video
      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(filepath),
        caption: `✅ *Video descargado exitosamente*\n\n📝 ${title}\n👤 ${author}`,
        mimetype: 'video/mp4'
      }, { quoted: m })

      // Limpiar archivo temporal
      fs.unlinkSync(filepath)

    } catch (downloadError) {
      console.error('Error en la descarga:', downloadError)
      
      // Limpiar archivo si existe
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }

      // Intentar método alternativo con solo audio
      if (downloadError.message.includes('410') || downloadError.message.includes('403')) {
        return conn.reply(m.chat, 
          '❌ *Error de descarga*\n\n' +
          'YouTube ha bloqueado la descarga de este video.\n' +
          'Esto puede deberse a:\n' +
          '• Restricciones de derechos de autor\n' +
          '• Video privado o eliminado\n' +
          '• Bloqueo temporal de YouTube\n\n' +
          'Intenta con otro video o espera unos minutos.', m)
      }

      return conn.reply(m.chat, `❌ Error al descargar el video: ${downloadError.message}`, m)
    }

  } catch (error) {
    console.error('Error general:', error)
    return conn.reply(m.chat, `❌ Error inesperado: ${error.message}`, m)
  }
}

// Configuración del comando
handler.help = ['video'].map(v => v + ' <búsqueda/url>')
handler.tags = ['downloader']
handler.command = ['video', 'ytmp4', 'ytvideo']
handler.register = true
handler.limit = 3

export default handler

// Función auxiliar para limpiar archivos temporales antiguos
export const cleanTempFiles = () => {
  const tempDir = './temp'
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir)
    const now = Date.now()
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file)
      const stats = fs.statSync(filePath)
      const fileAge = now - stats.mtime.getTime()
      
      // Eliminar archivos de más de 1 hora
      if (fileAge > 3600000) {
        fs.unlinkSync(filePath)
        console.log(`Archivo temporal eliminado: ${file}`)
      }
    })
  }
}

// Ejecutar limpieza cada hora
setInterval(cleanTempFiles, 3600000)
