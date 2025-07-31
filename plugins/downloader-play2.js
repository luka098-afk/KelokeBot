// plugins/video2.js - MÉTODO API (SIN DEPENDENCIAS EXTRA)
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { promisify } from 'util'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `❌ *Uso incorrecto*\n\nEjemplo: ${usedPrefix + command} Bad Bunny`, m)
  }

  const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  
  try {
    let videoUrl = text
    let videoId = ''
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
      videoId = searchResult.videoId
    } else {
      videoId = isUrl[1]
    }

    // Mostrar info del video encontrado
    if (searchResult) {
      const infoText = `📹 *Video encontrado*\n\n` +
                       `📝 ${searchResult.title.substring(0, 50)}${searchResult.title.length > 50 ? '...' : ''}\n` +
                       `👤 ${searchResult.author.name}\n` +
                       `⏱️ ${searchResult.timestamp}\n` +
                       `👀 ${searchResult.views.toLocaleString()}\n\n` +
                       `⬇️ *Obteniendo enlace de descarga...*`

      await conn.sendMessage(m.chat, {
        text: infoText,
        contextInfo: {
          externalAdReply: {
            title: searchResult.title,
            body: `${searchResult.author.name} • ${searchResult.timestamp}`,
            thumbnailUrl: searchResult.thumbnail,
            sourceUrl: videoUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    }

    // APIs públicas para descargar (múltiples respaldos)
    const APIs = [
      `https://api.cobalt.tools/api/json`,
      `https://api.youtubei.download/v1/video?url=${encodeURIComponent(videoUrl)}`,
      `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`
    ]

    let downloadUrl = null
    let videoInfo = null

    // Método 1: Cobalt Tools
    try {
      const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          url: videoUrl,
          vQuality: '720',
          vFormat: 'mp4',
          isAudioOnly: false
        })
      })

      const cobaltData = await cobaltResponse.json()
      
      if (cobaltData.status === 'success' || cobaltData.url) {
        downloadUrl = cobaltData.url
        videoInfo = {
          title: searchResult?.title || 'Video de YouTube',
          author: searchResult?.author?.name || 'Canal desconocido'
        }
        console.log('✅ Cobalt Tools funcionó')
      }
    } catch (cobaltError) {
      console.log('❌ Cobalt Tools falló:', cobaltError.message)
    }

    // Método 2: API alternativa si Cobalt falla
    if (!downloadUrl) {
      try {
        const altResponse = await fetch(`https://api.vevioz.com/api/button/mp4/320/${videoId}`)
        const altData = await altResponse.json()
        
        if (altData.success && altData.url) {
          downloadUrl = altData.url
          videoInfo = {
            title: altData.title || searchResult?.title || 'Video de YouTube',
            author: searchResult?.author?.name || 'Canal desconocido'
          }
          console.log('✅ API alternativa funcionó')
        }
      } catch (altError) {
        console.log('❌ API alternativa falló:', altError.message)
      }
    }

    // Método 3: Respaldo final
    if (!downloadUrl) {
      try {
        const backupResponse = await fetch(`https://api.alltubedownload.net/check?url=${encodeURIComponent(videoUrl)}`)
        const backupData = await backupResponse.json()
        
        if (backupData && backupData.formats) {
          const mp4Format = backupData.formats.find(f => f.ext === 'mp4' && f.height <= 720)
          if (mp4Format) {
            downloadUrl = mp4Format.url
            videoInfo = {
              title: backupData.title || searchResult?.title || 'Video de YouTube',
              author: searchResult?.author?.name || 'Canal desconocido'
            }
            console.log('✅ API de respaldo funcionó')
          }
        }
      } catch (backupError) {
        console.log('❌ API de respaldo falló:', backupError.message)
      }
    }

    if (!downloadUrl) {
      return conn.reply(m.chat, 
        '❌ *No se pudo obtener el enlace de descarga*\n\n' +
        '🔄 *Posibles causas:*\n' +
        '• Video con restricciones\n' +
        '• APIs temporalmente no disponibles\n' +
        '• Video muy reciente\n\n' +
        '💡 Intenta nuevamente en unos minutos', m)
    }

    await conn.reply(m.chat, '📥 *Descargando video...*', m)

    // Crear directorio temporal
    const tempDir = './temp'
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Generar nombre de archivo
    const cleanTitle = (videoInfo.title || 'video')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 40)
    
    const filename = `${cleanTitle}_${Date.now()}.mp4`
    const filepath = path.join(tempDir, filename)

    // Función para descargar archivo
    const downloadFile = (url, dest) => {
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest)
        const request = https.get(url, (response) => {
          // Verificar que la respuesta sea exitosa
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
            return
          }

          response.pipe(file)

          file.on('finish', () => {
            file.close()
            resolve()
          })

          file.on('error', (err) => {
            fs.unlink(dest, () => {}) // Eliminar archivo parcial
            reject(err)
          })
        })

        request.on('error', (err) => {
          fs.unlink(dest, () => {})
          reject(err)
        })

        // Timeout de 5 minutos
        request.setTimeout(300000, () => {
          request.destroy()
          fs.unlink(dest, () => {})
          reject(new Error('Timeout de descarga'))
        })
      })
    }

    try {
      // Descargar el video
      await downloadFile(downloadUrl, filepath)

      // Verificar archivo descargado
      const stats = fs.statSync(filepath)
      
      if (stats.size === 0) {
        fs.unlinkSync(filepath)
        throw new Error('Archivo descargado vacío')
      }

      // Verificar tamaño máximo (100MB)
      const maxSize = 100 * 1024 * 1024
      if (stats.size > maxSize) {
        fs.unlinkSync(filepath)
        return conn.reply(m.chat, 
          `❌ *Video muy grande*\n\n` +
          `📊 Tamaño: ${(stats.size / 1024 / 1024).toFixed(1)} MB\n` +
          `📏 Máximo: 100 MB`, m)
      }

      console.log(`✅ Video descargado: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

      // Enviar el video
      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(filepath),
        caption: `✅ *Descarga completada*\n\n` +
                `📝 *Título:* ${videoInfo.title}\n` +
                `👤 *Canal:* ${videoInfo.author}\n\n` +
                `🔗 *Fuente:* YouTube`,
        mimetype: 'video/mp4'
      }, { quoted: m })

      // Limpiar archivo temporal
      fs.unlinkSync(filepath)

    } catch (downloadError) {
      console.error('Error descargando:', downloadError)
      
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }

      return conn.reply(m.chat, 
        `❌ *Error en la descarga*\n\n` +
        `${downloadError.message}\n\n` +
        `💡 Intenta con otro video`, m)
    }

  } catch (error) {
    console.error('Error general:', error)
    return conn.reply(m.chat, `❌ Error inesperado: ${error.message}`, m)
  }
}

// Función para limpiar archivos antiguos
const cleanTempFiles = () => {
  const tempDir = './temp'
  if (!fs.existsSync(tempDir)) return
  
  const files = fs.readdirSync(tempDir)
  const now = Date.now()
  
  files.forEach(file => {
    try {
      const filePath = path.join(tempDir, file)
      const stats = fs.statSync(filePath)
      const age = now - stats.mtime.getTime()
      
      // Eliminar archivos de más de 1 hora
      if (age > 3600000) {
        fs.unlinkSync(filePath)
      }
    } catch (err) {
      console.error('Error limpiando archivo:', err)
    }
  })
}

// Limpiar cada hora
setInterval(cleanTempFiles, 3600000)

handler.help = ['video2'].map(v => v + ' <búsqueda/url>')
handler.tags = ['downloader']
handler.command = ['video2', 'ytapi', 'dlapi']
handler.register = true
handler.limit = 2

export default handler
