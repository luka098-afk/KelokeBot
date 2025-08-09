import { writeFileSync, unlinkSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileTypeFromBuffer } from 'file-type'
import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
  // Log para verificar que el comando se está ejecutando
  console.log('🔧 Comando tourl ejecutado')
  
  await conn.sendMessage(m.chat, { react: { text: '☁️', key: m.key } })

  try {
    // Crear directorio tmp si no existe
    if (!existsSync('./tmp')) {
      mkdirSync('./tmp', { recursive: true })
    }

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    
    if (!mime) {
      return conn.reply(m.chat, '🌧️ *Responde a un archivo o media para subirlo.*', m)
    }

    console.log('📁 Descargando archivo con mime:', mime)
    const media = await q.download()
    
    if (!media || media.length === 0) {
      return conn.reply(m.chat, '⛅ *Error al descargar el archivo.*', m)
    }

    console.log('📤 Archivo descargado, tamaño:', media.length, 'bytes')
    const uploads = []

    // Intentar subir a los servidores
    try {
      const up1 = await uploaderCloudStack(media)
      if (up1) uploads.push({ name: '☁️ CloudStack', url: up1 })
    } catch (e) { console.log('CloudStack falló:', e.message) }

    try {
      const up2 = await uploaderCloudGuru(media)
      if (up2) uploads.push({ name: '🌀 CloudGuru', url: up2 })
    } catch (e) { console.log('CloudGuru falló:', e.message) }

    try {
      const up3 = await uploaderCloudCom(media)
      if (up3) uploads.push({ name: '🌐 CloudImages', url: up3 })
    } catch (e) { console.log('CloudCom falló:', e.message) }

    if (uploads.length === 0) {
      throw '⛈️ *No se pudo subir a ningún servidor. Intenta de nuevo más tarde.*'
    }

    let texto = `☁️ *Resultado de la Subida*\n*━━━━━━━━━━━━━━━━━━━━*\n\n`
    for (const up of uploads) {
      texto += `*${up.name}*\n🔗 ${up.url}\n\n`
    }

    await conn.sendMessage(m.chat, {
      text: texto.trim(),
      contextInfo: {
        externalAdReply: {
          title: 'Uploader Tools ☁️',
          body: 'Enlaces generados desde servidores externos',
          thumbnailUrl: uploads[0]?.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error('❌ Error en handler:', e)
    await conn.reply(m.chat, typeof e === 'string' ? e : '⛈️ *Ocurrió un error inesperado durante la subida.*', m)
  } finally {
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  }
}

// CONFIGURACIÓN DEL COMANDO - SOLO TOURL
handler.help = ['tourl']
handler.tags = ['tools']
handler.command = ['tourl']
handler.limit = true
handler.register = true

export default handler

// Función para subir archivo usando FormData nativo de Node.js
async function uploadTo(url, buffer) {
  try {
    const fileType = await fileTypeFromBuffer(buffer)
    const ext = fileType?.ext || 'bin'
    const mime = fileType?.mime || 'application/octet-stream'
    
    console.log(`📄 Detectado: .${ext} (${mime})`)
    
    // Crear boundary para FormData manual
    const boundary = '----formdata-' + Math.random().toString(36)
    const filename = `upload_${Date.now()}.${ext}`
    
    // Construir FormData manualmente
    let formData = ''
    formData += `--${boundary}\r\n`
    formData += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`
    formData += `Content-Type: ${mime}\r\n\r\n`
    
    const formDataBuffer = Buffer.concat([
      Buffer.from(formData, 'utf8'),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
    ])

    console.log(`📡 Subiendo ${formDataBuffer.length} bytes a: ${url}`)
    
    const response = await fetch(url, {
      method: 'POST',
      body: formDataBuffer,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formDataBuffer.length
      },
      timeout: 30000
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('📨 Respuesta:', result)

    if (result.status === 'success' && result.data?.url) {
      return result.data.url
    }
    
    throw new Error('Respuesta del servidor inválida')
    
  } catch (error) {
    console.error(`❌ Error en ${url}:`, error.message)
    throw error
  }
}

// Servicios de upload
const uploaderCloudStack = async (buffer) => {
  return await uploadTo('https://phpstack-1487948-5667813.cloudwaysapps.com/upload.php', buffer)
}

const uploaderCloudGuru = async (buffer) => {
  return await uploadTo('https://cloudkuimages.guru/upload.php', buffer)
}

const uploaderCloudCom = async (buffer) => {
  return await uploadTo('https://cloudkuimages.com/upload.php', buffer)
}
