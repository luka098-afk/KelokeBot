// plugins/video2.js - MÉTODO API MEJORADO CON MEJOR MANEJO DE ERRORES
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
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
      // Obtener info del video por ID
      try {
        const search = await yts({ videoId })
        if (search) {
          searchResult = search
        }
      } catch (err) {
        console.log('No se pudo obtener info del video:', err.message)
      }
    }

    // Mostrar info del video encontrado
    if (searchResult) {
      const infoText = `📹 *Video encontrado*\n\n` +
                       `📝 ${searchResult.title?.substring(0, 50)}${searchResult.title?.length > 50 ? '...' : ''}\n` +
                       `👤 ${searchResult.author?.name || 'Canal desconocido'}\n` +
                       `⏱️ ${searchResult.timestamp || 'N/A'}\n` +
                       `👀 ${searchResult.views?.toLocaleString() || 'N/A'}\n\n` +
                       `⬇️ *Obteniendo enlace de descarga...*`

      await conn.sendMessage(m.chat, {
        text: infoText,
        contextInfo: {
          externalAdReply: {
            title: searchResult.title || 'Video de YouTube',
            body: `${searchResult.author?.name || 'Canal'} • ${searchResult.timestamp || ''}`,
            thumbnailUrl: searchResult.thumbnail,
            sourceUrl: videoUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    }

    let downloadUrl = null
    let videoInfo = null

    // Función auxiliar para hacer requests HTTP/HTTPS con timeout
    const makeRequest = (url, options = {}) => {
      return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https')
        const client = isHttps ? https : http
        
        const requestOptions = {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            ...options.headers
          },
          ...options
        }

        const req = client.request(url, requestOptions, (res) => {
          let data = ''
          
          res.on('data', chunk => {
            data += chunk
          })
          
          res.on('end', () => {
            try {
              // Intentar parsear como JSON
              const jsonData = JSON.parse(data)
              resolve({ statusCode: res.statusCode, data: jsonData, raw: data })
            } catch (parseError) {
              // Si falla el JSON, devolver datos raw
              resolve({ statusCode: res.statusCode, data: null, raw: data })
            }
          })
        })

        req.on('error', reject)
        req.on('timeout', () => {
          req.destroy()
          reject(new Error('Request timeout'))
        })

        if (options.body) {
          req.write(options.body)
        }
        
        req.end()
      })
    }

    // Método 1: API pública de YT-DLP
    try {
      console.log('🔄 Intentando API ytdlp.org...')
      const ytdlpUrl = `https://api.ytdlp.org/v1/extract?url=${encodeURIComponent(videoUrl)}`
      const response = await makeRequest(ytdlpUrl)
      
      if (response.statusCode === 200 && response.data) {
        const formats = response.data.formats || []
        const mp4Format = formats.find(f => 
          f.ext === 'mp4' && 
          f.vcodec !== 'none' && 
          f.height <= 720 && 
          f.height >= 360
        )
        
        if (mp4Format && mp4Format.url) {
          downloadUrl = mp4Format.url
          videoInfo = {
            title: response.data.title || searchResult?.title || 'Video de YouTube',
            author: response.data.uploader || searchResult?.author?.name || 'Canal desconocido',
            duration: response.data.duration
          }
          console.log('✅ ytdlp.org funcionó')
        }
      }
    } catch (error) {
      console.log('❌ ytdlp.org falló:', error.message)
    }

    // Método 2: API Loader.to
    if (!downloadUrl) {
      try {
        console.log('🔄 Intentando loader.to...')
        const loaderResponse = await makeRequest('https://loader.to/api/button/resolve/load/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `url=${encodeURIComponent(videoUrl)}&f=mp4&lang=es`
        })
        
        if (loaderResponse.statusCode === 200 && loaderResponse.data?.success) {
          downloadUrl = loaderResponse.data.url
          videoInfo = {
            title: loaderResponse.data.title || searchResult?.title || 'Video de YouTube',
            author: searchResult?.author?.name || 'Canal desconocido'
          }
          console.log('✅ loader.to funcionó')
        }
      } catch (error) {
        console.log('❌ loader.to falló:', error.message)
      }
    }

    // Método 3: API SaveFrom.net
    if (!downloadUrl) {
      try {
        console.log('🔄 Intentando savefrom.net...')
        const saveFromUrl = `https://worker.sf-tools.com/savefrom.net/web/analyze/link/get?url=${encodeURIComponent(videoUrl)}&lang=es&t=${Date.now()}`
        
        const saveFromResponse = await makeRequest(saveFromUrl, {
          headers: {
            'Referer': 'https://savefrom.net/',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
        
        if (saveFromResponse.statusCode === 200 && saveFromResponse.data?.urls) {
          const urls = saveFromResponse.data.urls
          const mp4Url = urls.find(u => u.type === 'mp4' && u.quality !== 'hd')
          
          if (mp4Url && mp4Url.url) {
            downloadUrl = mp4Url.url
            videoInfo = {
              title: saveFromResponse.data.meta?.title || searchResult?.title || 'Video de YouTube',
              author: searchResult?.author?.name || 'Canal desconocido'
            }
            console.log('✅ savefrom.net funcionó')
          }
        }
      } catch (error) {
        console.log('❌ savefrom.net falló:', error.message)
      }
    }

    // Método 4: API Y2mate
    if (!downloadUrl) {
      try {
        console.log('🔄 Intentando y2mate...')
        // Primero obtener la página de análisis
        const analyzeResponse = await makeRequest('https://www.y2mate.com/mates/en/analyze/ajax', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://www.y2mate.com',
            'Referer': 'https://www.y2mate.com/'
          },
          body: `url=${encodeURIComponent(videoUrl)}&q_auto=1&ajax=1`
        })
        
        if (analyzeResponse.statusCode === 200 && analyzeResponse.data?.status === 'ok') {
          // Buscar el k de calidad 360p o 720p
          const resultHtml = analyzeResponse.data.result
          const kMatch = resultHtml.match(/k="([^"]+)"[^>]*>360p|k="([^"]+)"[^>]*>720p/)
          
          if (kMatch) {
            const k = kMatch[1] || kMatch[2]
            
            // Obtener enlace de descarga
            const convertResponse = await makeRequest('https://www.y2mate.com/mates/en/convert', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://www.y2mate.com',
                'Referer': 'https://www.y2mate.com/'
              },
              body: `vid=${videoId}&k=${k}`
            })
            
            if (convertResponse.statusCode === 200 && convertResponse.data?.status === 'ok') {
              const dlinkMatch = convertResponse.data.result.match(/href="([^"]+)">Download/)
              if (dlinkMatch) {
                downloadUrl = dlinkMatch[1]
                videoInfo = {
                  title: searchResult?.title || 'Video de YouTube',
                  author: searchResult?.author?.name || 'Canal desconocido'
                }
                console.log('✅ y2mate funcionó')
              }
            }
          }
        }
      } catch (error) {
        console.log('❌ y2mate falló:', error.message)
      }
    }

    if (!downloadUrl) {
      return conn.reply(m.chat, 
        '❌ *No se pudo obtener el enlace de descarga*\n\n' +
        '🔄 *Posibles causas:*\n' +
        '• Video con restricciones de edad\n' +
        '• Video privado o eliminado\n' +
        '• APIs temporalmente no disponibles\n' +
        '• Video muy reciente\n\n' +
        '💡 *Soluciones:*\n' +
        '• Intenta con otro video\n' +
        '• Verifica que el enlace sea público\n' +
        '• Espera unos minutos y vuelve a intentar', m)
    }

    await conn.reply(m.chat, '📥 *Descargando video...*', m)

    // Crear directorio temporal
    const tempDir = './temp'
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Generar nombre de archivo seguro
    const cleanTitle = (videoInfo.title || 'video')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30)
    
    const filename = `${cleanTitle}_${Date.now()}.mp4`
    const filepath = path.join(tempDir, filename)

    // Función mejorada para descargar archivo
    const downloadFile = (url, dest) => {
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest)
        const isHttps = url.startsWith('https')
        const client = isHttps ? https : http
        
        const request = client.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
          },
          timeout: 30000
        }, (response) => {
          // Manejar redirecciones
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            file.close()
            fs.unlink(dest, () => {})
            return downloadFile(response.headers.location, dest).then(resolve).catch(reject)
          }

          // Verificar que la respuesta sea exitosa
          if (response.statusCode !== 200) {
            file.close()
            fs.unlink(dest, () => {})
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
            return
          }

          // Verificar que sea contenido de video
          const contentType = response.headers['content-type'] || ''
          if (!contentType.includes('video') && !contentType.includes('octet-stream')) {
            file.close()
            fs.unlink(dest, () => {})
            reject(new Error('El contenido no parece ser un video'))
            return
          }

          let downloadedBytes = 0
          const totalBytes = parseInt(response.headers['content-length']) || 0

          response.on('data', (chunk) => {
            downloadedBytes += chunk.length
            
            // Verificar tamaño máximo durante la descarga (150MB)
            if (downloadedBytes > 150 * 1024 * 1024) {
              file.close()
              fs.unlink(dest, () => {})
              reject(new Error('El archivo es demasiado grande (>150MB)'))
              return
            }
          })

          response.pipe(file)

          file.on('finish', () => {
            file.close()
            console.log(`✅ Descarga completada: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB`)
            resolve()
          })

          file.on('error', (err) => {
            file.close()
            fs.unlink(dest, () => {})
            reject(err)
          })
        })

        request.on('error', (err) => {
          file.close()
          fs.unlink(dest, () => {})
          reject(err)
        })

        request.on('timeout', () => {
          request.destroy()
          file.close()
          fs.unlink(dest, () => {})
          reject(new Error('Timeout de descarga (30s)'))
        })
      })
    }

    try {
      // Descargar el video
      await downloadFile(downloadUrl, filepath)

      // Verificar archivo descargado
      if (!fs.existsSync(filepath)) {
        throw new Error('El archivo no se descargó correctamente')
      }

      const stats = fs.statSync(filepath)
      
      if (stats.size === 0) {
        fs.unlinkSync(filepath)
        throw new Error('Archivo descargado vacío')
      }

      if (stats.size < 1024) {
        fs.unlinkSync(filepath)
        throw new Error('Archivo demasiado pequeño, posible error')
      }

      console.log(`✅ Video listo: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)

      // Enviar el video
      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(filepath),
        caption: `✅ *Descarga completada*\n\n` +
                `📝 *Título:* ${videoInfo.title}\n` +
                `👤 *Canal:* ${videoInfo.author}\n` +
                `📊 *Tamaño:* ${(stats.size / 1024 / 1024).toFixed(2)} MB\n\n` +
                `🔗 *Fuente:* YouTube\n` +
                `⚡ *Bot:* ${conn.user.name}`,
        mimetype: 'video/mp4'
      }, { quoted: m })

      // Limpiar archivo temporal
      fs.unlinkSync(filepath)

    } catch (downloadError) {
      console.error('Error descargando:', downloadError)
      
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }

      let errorMsg = '❌ *Error en la descarga*\n\n'
      
      if (downloadError.message.includes('demasiado grande')) {
        errorMsg += '📊 El video supera el límite de 150MB\n💡 Intenta con un video más corto'
      } else if (downloadError.message.includes('timeout')) {
        errorMsg += '⏱️ La descarga tardó demasiado\n💡 Intenta nuevamente o con otro video'
      } else if (downloadError.message.includes('HTTP')) {
        errorMsg += '🔗 El enlace de descarga expiró\n💡 Intenta nuevamente'
      } else {
        errorMsg += `🔧 ${downloadError.message}\n💡 Intenta con otro video o más tarde`
      }

      return conn.reply(m.chat, errorMsg, m)
    }

  } catch (error) {
    console.error('Error general:', error)
    return conn.reply(m.chat, 
      `❌ *Error inesperado*\n\n` +
      `${error.message}\n\n` +
      `💡 Reporta este error si persiste`, m)
  }
}

// Función para limpiar archivos temporales antiguos
const cleanTempFiles = () => {
  const tempDir = './temp'
  if (!fs.existsSync(tempDir)) return
  
  try {
    const files = fs.readdirSync(tempDir)
    const now = Date.now()
    let cleaned = 0
    
    files.forEach(file => {
      try {
        const filePath = path.join(tempDir, file)
        const stats = fs.statSync(filePath)
        const age = now - stats.mtime.getTime()
        
        // Eliminar archivos de más de 30 minutos
        if (age > 1800000) {
          fs.unlinkSync(filePath)
          cleaned++
        }
      } catch (err) {
        console.error('Error limpiando archivo:', file, err.message)
      }
    })
    
    if (cleaned > 0) {
      console.log(`🧹 Limpiados ${cleaned} archivos temporales`)
    }
  } catch (err) {
    console.error('Error en limpieza general:', err)
  }
}

// Limpiar cada 30 minutos
setInterval(cleanTempFiles, 1800000)

// Limpieza inicial
setTimeout(cleanTempFiles, 5000)

handler.help = ['video2'].map(v => v + ' <búsqueda/url>')
handler.tags = ['downloader']
handler.command = ['video2', 'ytapi', 'dlapi']
handler.register = true
handler.limit = 2

export default handler
