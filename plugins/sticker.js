import { spawn } from 'child_process'
import { writeFile, unlink, readFile, access } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        if (!mime) {
            throw '🖼️ *Responde a una imagen, video, gif o sticker*\n\n*Ejemplo:*\n• Envía una imagen y responde con ' + usedPrefix + command
        }

        if (/image|video|webp/.test(mime)) {
            if (/video/.test(mime) && (q.msg || q).seconds > 10) {
                throw '⏰ *El video no puede durar más de 10 segundos*'
            }

            let img = await q.download?.()
            if (!img) throw '❌ No se pudo descargar el archivo'

            console.log('Descarga exitosa, creando sticker...')
            
            // Usar nuestra función corregida
            let stiker = await createSticker(img)

            if (stiker) {
                // Método alternativo de envío
                try {
                    await conn.sendMessage(m.chat, {
                        sticker: stiker
                    }, {
                        quoted: m
                    })
                    console.log('Sticker enviado exitosamente')
                } catch (sendError) {
                    console.error('Error enviando con sendMessage:', sendError)
                    // Fallback: intentar con sendFile
                    try {
                        await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
                        console.log('Sticker enviado con sendFile')
                    } catch (sendFileError) {
                        console.error('Error enviando con sendFile:', sendFileError)
                        throw '❌ Error al enviar el sticker'
                    }
                }
            } else {
                throw '❌ Error al crear el sticker'
            }
        } else {
            throw '🚫 *Formato no soportado*\n\n*Formatos válidos:* JPG, PNG, GIF, MP4, WEBP'
        }

    } catch (e) {
        console.error('Error en sticker:', e)
        let errorMsg = typeof e === 'string' ? e : '🔧 Error de conversión. Verifica que el archivo sea válido.'
        m.reply(errorMsg)
    }
}

handler.help = ['stiker', 'sticker', 's']
handler.tags = ['sticker']
handler.command = /^s(tic?ker)?(gif)?$/i

export default handler

// Función para crear stickers sin errores
async function createSticker(buffer) {
    // Asegurar que el directorio tmp existe
    const tempDir = tmpdir()
    if (!existsSync(tempDir)) {
        try {
            mkdirSync(tempDir, { recursive: true })
        } catch (error) {
            console.error('Error creando directorio tmp:', error)
        }
    }

    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const tmp = join(tempDir, `sticker_${timestamp}_${random}`)
    const input = `${tmp}_input`
    const output = `${tmp}_output.webp`

    try {
        console.log('Escribiendo archivo temporal:', input)
        await writeFile(input, buffer)
        
        // Verificar que el archivo se creó correctamente
        await access(input)
        console.log('Archivo temporal creado exitosamente')

        // Configuración simple y efectiva
        const ffmpegArgs = [
            '-i', input,
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0',
            '-c:v', 'libwebp',
            '-quality', '75',
            '-method', '4',
            '-f', 'webp',
            '-y', // Sobrescribir archivo de salida si existe
            output
        ]

        console.log('Ejecutando FFmpeg...')
        await runFFmpeg(ffmpegArgs)
        
        // Verificar que el archivo de salida existe
        await access(output)
        console.log('Sticker creado exitosamente')
        
        const stickerBuffer = await readFile(output)
        
        // Limpiar archivos temporales
        await cleanup(input, output)
        
        return stickerBuffer

    } catch (error) {
        console.error('Error en createSticker:', error)
        await cleanup(input, output)
        
        // Fallback: intentar con configuración más simple
        try {
            console.log('Intentando con configuración básica...')
            return await createStickerSimple(buffer)
        } catch (fallbackError) {
            console.error('Error en fallback:', fallbackError)
            throw new Error('No se pudo crear el sticker: ' + error.message)
        }
    }
}

// Función de respaldo más simple
async function createStickerSimple(buffer) {
    const tempDir = tmpdir()
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const tmp = join(tempDir, `simple_${timestamp}_${random}`)
    const input = `${tmp}_input`
    const output = `${tmp}_output.webp`

    try {
        await writeFile(input, buffer)
        
        const simpleArgs = [
            '-i', input,
            '-vf', 'scale=512:512',
            '-c:v', 'libwebp',
            '-f', 'webp',
            '-y',
            output
        ]

        await runFFmpeg(simpleArgs)
        const stickerBuffer = await readFile(output)
        
        await cleanup(input, output)
        return stickerBuffer

    } catch (error) {
        await cleanup(input, output)
        throw error
    }
}

function runFFmpeg(args) {
    return new Promise((resolve, reject) => {
        console.log('FFmpeg args:', args.join(' '))
        
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
                console.log('FFmpeg completado exitosamente')
                resolve(true)
            } else {
                console.error('FFmpeg error code:', code)
                console.error('FFmpeg stderr:', stderr)
                reject(new Error(`FFmpeg falló con código ${code}: ${stderr}`))
            }
        })

        ffmpeg.on('error', (error) => {
            console.error('FFmpeg spawn error:', error)
            reject(new Error(`Error ejecutando FFmpeg: ${error.message}`))
        })

        // Timeout de seguridad (30 segundos)
        setTimeout(() => {
            ffmpeg.kill('SIGTERM')
            reject(new Error('FFmpeg timeout - proceso terminado'))
        }, 30000)
    })
}

async function cleanup(input, output) {
    const files = [input, output]
    
    for (const file of files) {
        try {
            await access(file)
            await unlink(file)
            console.log('Archivo limpiado:', file)
        } catch (error) {
            // Archivo no existe o ya fue eliminado
        }
    }
}
