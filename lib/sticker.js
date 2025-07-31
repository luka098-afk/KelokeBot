import { spawn } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileTypeFromBuffer } from 'file-type'
import { promisify } from 'util'

/**
 * Convert buffer to webp sticker
 * @param {Buffer} img Buffer input
 * @param {Boolean} url Is url (not supported)
 * @param {String} packname Sticker pack name
 * @param {String} author Sticker author
 * @returns {Promise<Buffer>}
 */
export async function sticker(img, url = false, packname = 'Sticker', author = 'Bot') {
  if (url) {
    throw new Error('URL input not supported in this version')
  }

  if (!Buffer.isBuffer(img)) {
    throw new Error('Input must be a Buffer')
  }

  const tmpDir = join(process.cwd(), 'tmp')
  
  // Crear directorio tmp si no existe
  if (!existsSync(tmpDir)) {
    try {
      mkdirSync(tmpDir, { recursive: true })
      console.log('📁 Directorio tmp creado:', tmpDir)
    } catch (err) {
      console.error('❌ Error creando directorio tmp:', err.message)
      throw new Error('No se pudo crear el directorio temporal')
    }
  }

  const timestamp = Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  let inputPath = null
  let outputPath = null

  try {
    // Detectar tipo de archivo
    const type = await fileTypeFromBuffer(img)
    const ext = type?.ext || 'bin'
    const mime = type?.mime || 'application/octet-stream'
    
    inputPath = join(tmpDir, `input_${timestamp}.${ext}`)
    outputPath = join(tmpDir, `output_${timestamp}.webp`)

    console.log(`🔄 Convirtiendo ${ext} (${mime}) a webp...`)
    console.log(`📥 Input: ${inputPath}`)
    console.log(`📤 Output: ${outputPath}`)

    // Escribir archivo de entrada
    writeFileSync(inputPath, img)
    
    if (!existsSync(inputPath)) {
      throw new Error('No se pudo escribir el archivo temporal de entrada')
    }

    console.log(`✅ Archivo temporal creado: ${img.length} bytes`)

    // Crear el sticker usando ffmpeg con Promise
    await convertToWebp(inputPath, outputPath, mime)

    // Verificar que el archivo se creó
    if (!existsSync(outputPath)) {
      throw new Error('FFmpeg no generó el archivo de salida')
    }

    // Leer el resultado inmediatamente
    const result = readFileSync(outputPath)
    console.log(`✅ Sticker generado: ${result.length} bytes`)

    // Limpiar archivos inmediatamente después de leer
    cleanupFiles([inputPath, outputPath])

    // Agregar metadatos básicos
    const withMeta = addBasicMetadata(result, packname, author)
    
    return withMeta

  } catch (error) {
    console.error('❌ Error en sticker():', error.message)
    // Limpiar archivos en caso de error
    cleanupFiles([inputPath, outputPath])
    throw error
  }
}

/**
 * Convert image to webp using ffmpeg
 * @param {string} inputPath 
 * @param {string} outputPath 
 * @param {string} mime 
 * @returns {Promise<void>}
 */
function convertToWebp(inputPath, outputPath, mime) {
  return new Promise((resolve, reject) => {
    let args

    // Diferentes argumentos según el tipo de archivo
    if (mime.startsWith('video/')) {
      // Para videos/GIFs - Stickers más grandes
      args = [
        '-y', // Sobrescribir
        '-i', inputPath,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=transparent',
        '-c:v', 'libwebp',
        '-f', 'webp',
        '-preset', 'drawing',
        '-loop', '0',
        '-quality', '85',
        '-compression_level', '4',
        '-an', // Sin audio
        '-vsync', '0',
        '-t', '8', // Máximo 8 segundos
        outputPath
      ]
    } else {
      // Para imágenes estáticas - Stickers más grandes y mejor calidad
      args = [
        '-y', // Sobrescribir
        '-i', inputPath,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=transparent',
        '-c:v', 'libwebp',
        '-f', 'webp',
        '-quality', '95',
        '-preset', 'photo',
        '-lossless', '0',
        '-method', '6',
        outputPath
      ]
    }

    console.log(`🔧 Ejecutando: ffmpeg ${args.join(' ')}`)

    const ffmpeg = spawn('ffmpeg', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stderr = ''
    let stdout = ''

    ffmpeg.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log('✅ FFmpeg completado exitosamente')
        resolve()
      } else {
        console.error('❌ FFmpeg stderr:', stderr)
        reject(new Error(`FFmpeg falló con código ${code}: ${stderr}`))
      }
    })

    ffmpeg.on('error', (err) => {
      console.error('❌ Error ejecutando FFmpeg:', err.message)
      reject(new Error(`Error ejecutando FFmpeg: ${err.message}`))
    })

    // Timeout de 30 segundos
    setTimeout(() => {
      ffmpeg.kill('SIGKILL')
      reject(new Error('FFmpeg timeout - proceso terminado'))
    }, 30000)
  })
}

/**
 * Add basic metadata to webp
 * @param {Buffer} webpBuffer 
 * @param {String} packname 
 * @param {String} author 
 * @returns {Buffer}
 */
function addBasicMetadata(webpBuffer, packname, author) {
  try {
    // Por ahora retornamos el buffer original
    // En el futuro se puede implementar EXIF real
    return webpBuffer
  } catch (error) {
    console.warn('⚠️ No se pudieron agregar metadatos:', error.message)
    return webpBuffer
  }
}

/**
 * Clean up temporary files
 * @param {string[]} files 
 */
function cleanupFiles(files) {
  for (const file of files) {
    if (file && existsSync(file)) {
      try {
        unlinkSync(file)
        console.log(`🗑️ Archivo temporal eliminado: ${file}`)
      } catch (err) {
        console.warn(`⚠️ No se pudo eliminar: ${file} - ${err.message}`)
      }
    }
  }
}

/**
 * Alternative simple sticker function
 * @param {Buffer} buffer 
 * @param {String} packname 
 * @param {String} author 
 * @returns {Promise<Buffer>}
 */
export async function stickerSimple(buffer, packname = 'Sticker', author = 'Bot') {
  try {
    return await sticker(buffer, false, packname, author)
  } catch (error) {
    console.error('❌ Error en stickerSimple:', error.message)
    throw error
  }
}

// Support object
export const support = {
  ffmpeg: true,
  ffprobe: true,
  ffmpegWebp: true,
  convert: false,
  magick: false,
  gm: false,
  find: false
}

export default sticker
