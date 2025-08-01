import { spawn } from 'child_process'
import { writeFile, unlink, readFile } from 'fs/promises'
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
            
            // Usar nuestra función corregida
            let stiker = await createSticker(img)
            
            if (stiker) {
                await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
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

// Función para crear stickers sin el error de transparent
async function createSticker(buffer) {
    const tmp = join(tmpdir(), `sticker_${Date.now()}_${Math.random().toString(36).substring(7)}`)
    const input = `${tmp}_input`
    const output = `${tmp}_output.webp`
    
    try {
        await writeFile(input, buffer)
        
        // Opción 1: Sin padding (más simple)
        const ffmpegArgs1 = [
            '-i', input,
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
            '-vcodec', 'libwebp',
            '-q:v', '50',
            '-preset', 'default',
            '-loop', '0',
            '-an',
            '-f', 'webp',
            output
        ]
        
        // Opción 2: Con padding usando color válido
        const ffmpegArgs2 = [
            '-i', input,
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:white',
            '-vcodec', 'libwebp',
            '-q:v', '50',
            '-preset', 'default',
            '-loop', '0',
            '-an',
            '-f', 'webp',
            output
        ]
        
        // Opción 3: Más básica
        const ffmpegArgs3 = [
            '-i', input,
            '-vf', 'scale=512:512',
            '-c:v', 'libwebp',
            '-quality', '50',
            '-method', '4',
            '-f', 'webp',
            output
        ]
        
        // Intentar diferentes configuraciones
        const configs = [ffmpegArgs1, ffmpegArgs3, ffmpegArgs2]
        
        for (let i = 0; i < configs.length; i++) {
            try {
                const result = await runFFmpeg(configs[i])
                if (result) {
                    const stickerBuffer = await readFile(output)
                    
                    // Limpiar archivos
                    await cleanup(input, output)
                    
                    return stickerBuffer
                }
            } catch (error) {
                console.log(`Intento ${i + 1} falló:`, error.message)
                if (i === configs.length - 1) {
                    throw error
                }
            }
        }
        
    } catch (error) {
        await cleanup(input, output)
        throw error
    }
}

function runFFmpeg(args) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', ['-y', ...args], {
            stdio: ['pipe', 'pipe', 'pipe']
        })
        
        let stderr = ''
        
        ffmpeg.stderr.on('data', (data) => {
            stderr += data.toString()
        })
        
        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(new Error(`FFmpeg error: ${stderr}`))
            }
        })
        
        ffmpeg.on('error', (error) => {
            reject(error)
        })
    })
}

async function cleanup(input, output) {
    try {
        await unlink(input)
    } catch {}
    
    try {
        await unlink(output)
    } catch {}
}
