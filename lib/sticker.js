import { spawn } from 'child_process'
import { join } from 'path'
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { fileTypeFromBuffer } from 'file-type'

const support = {
  ffmpeg: true,
  ffprobe: true,
  ffmpegWebp: true,
  convert: true,
  magick: true,
  gm: true,
  find: false
}

/**
 * Converts buffer to webp sticker
 * @param {Buffer} img Buffer input
 * @param {Boolean} url Is url?
 * @param {String} packname Sticker pack name
 * @param {String} author Sticker author
 * @returns {Promise<Buffer>}
 */
async function sticker(img, url = false, packname = 'Sticker', author = 'Bot') {
  if (url) {
    throw new Error('URL input not supported in this version')
  }

  const tmpDir = join(process.cwd(), 'tmp')
  
  // Crear directorio tmp si no existe
  if (!existsSync(tmpDir)) {
    mkdirSync(tmpDir, { recursive: true })
  }

  const filename = Date.now()
  const input = join(tmpDir, `${filename}_input`)
  const output = join(tmpDir, `${filename}_output.webp`)

  try {
    // Detectar tipo de archivo
    const type = await fileTypeFromBuffer(img)
    const inputExt = type?.ext || 'unknown'
    const inputPath = `${input}.${inputExt}`

    console.log(`Procesando sticker: ${inputExt} -> webp`)

    // Escribir archivo temporal
    writeFileSync(inputPath, img)

    if (!existsSync(inputPath)) {
      throw new Error(`No se pudo crear el archivo temporal: ${inputPath}`)
    }

    // Convertir a webp usando ffmpeg
    await new Promise((resolve, reject) => {
      const args = [
        '-i', inputPath,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=transparent',
        '-vcodec', 'libwebp',
        '-f', 'webp',
        '-lossless', '0',
        '-q:v', '90',
        '-preset', 'default',
        '-loop', '0',
        '-an',
        '-vsync', '0',
        '-s', '512x512',
        output
      ]

      console.log(`Ejecutando: ffmpeg ${args.join(' ')}`)

      const ffmpeg = spawn('ffmpeg', args, {
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stderr = ''

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      ffmpeg.on('close', (code) => {
        if (code === 0 && existsSync(output)) {
          resolve()
        } else {
          reject(new Error(`FFmpeg falló con código ${code}. Error: ${stderr}`))
        }
      })

      ffmpeg.on('error', (err) => {
        reject(new Error(`Error ejecutando FFmpeg: ${err.message}`))
      })
    })

    // Leer el archivo resultante
    if (!existsSync(output)) {
      throw new Error(`No se generó el archivo de salida: ${output}`)
    }

    const result = require('fs').readFileSync(output)

    // Agregar metadata si es posible
    const stickerWithMeta = await addExifData(result, packname, author)

    return stickerWithMeta || result

  } catch (error) {
    console.error('Error en sticker():', error)
    throw error
  } finally {
    // Limpiar archivos temporales
    try {
      const filesToClean = [
        `${input}.${fileTypeFromBuffer(img)?.ext || 'unknown'}`,
        input,
        output
      ]

      for (const file of filesToClean) {
        if (existsSync(file)) {
          unlinkSync(file)
        }
      }
    } catch (cleanupError) {
      console.warn('Error limpiando archivos temporales:', cleanupError.message)
    }
  }
}

/**
 * Add EXIF data to webp
 * @param {Buffer} webpBuffer 
 * @param {String} packname 
 * @param {String} author 
 * @returns {Promise<Buffer>}
 */
async function addExifData(webpBuffer, packname, author) {
  try {
    const exif = {
      'sticker-pack-id': 'sticker-pack-id',
      'sticker-pack-name': packname,
      'sticker-pack-publisher': author,
      'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.whatsapp',
      'ios-app-store-link': 'https://itunes.apple.com/app/whatsapp-messenger/id310633997'
    }

    const exifBuffer = Buffer.from(JSON.stringify(exif))
    
    // Crear WebP con EXIF básico
    const header = Buffer.from('RIFF')
    const webpHeader = Buffer.from('WEBP')
    const exifChunk = Buffer.concat([
      Buffer.from('EXIF'),
      Buffer.alloc(4),
      exifBuffer
    ])

    // Calcular tamaño total
    const totalSize = webpBuffer.length + exifChunk.length + 8
    const sizeBuffer = Buffer.alloc(4)
    sizeBuffer.writeUInt32LE(totalSize - 8, 0)

    return Buffer.concat([
      header,
      sizeBuffer,
      webpHeader,
      webpBuffer.slice(12), // Saltar el header original de WebP
      exifChunk
    ])

  } catch (error) {
    console.warn('No se pudo agregar EXIF:', error.message)
    return webpBuffer
  }
}

/**
 * Convert buffer to sticker (alternative method)
 * @param {Buffer} buffer 
 * @param {String} packname 
 * @param {String} author 
 * @returns {Promise<Buffer>}
 */
async function stickerSimple(buffer, packname = 'Sticker', author = 'Bot') {
  try {
    return await sticker(buffer, false, packname, author)
  } catch (error) {
    console.error('Error en stickerSimple:', error)
    throw error
  }
}

export {
  sticker,
  stickerSimple,
  support
}

export default sticker
