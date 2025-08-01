import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2png.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        
        if (!mime) {
            throw '🖼️ *Responde a una imagen, video, gif o sticker*\n\n*Ejemplo:*\n• Envía una imagen y responde con ' + usedPrefix + command
        }

        if (/webp/.test(mime)) {
            // Si es un sticker, convertir a imagen
            let img = await q.download?.()
            if (!img) throw '❌ No se pudo descargar el archivo'
            
            let out = await webp2png(img).catch(_ => null) || Buffer.alloc(0)
            if (!out || !out.length) throw '❌ Error al convertir el sticker'
            
            stiker = await sticker(out, false, global.packname, global.author)
        } else if (/image|video/.test(mime)) {
            // Si es imagen o video
            if (/video/.test(mime) && (q.msg || q).seconds > 10) {
                throw '⏰ *El video no puede durar más de 10 segundos*'
            }
            
            let img = await q.download?.()
            if (!img) throw '❌ No se pudo descargar el archivo'
            
            // Crear sticker con configuración mejorada para evitar el error de transparent
            stiker = await createStickerFixed(img, false, global.packname || 'RoxyBot', global.author || 'Bot')
        } else {
            throw '🚫 *Formato no soportado*\n\n*Formatos válidos:* JPG, PNG, GIF, MP4, WEBP'
        }

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
        } else {
            throw '❌ Error al crear el sticker'
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

// Función personalizada para crear stickers sin usar 'transparent'
async function createStickerFixed(img, url, packname, author, quality = 60) {
    const { spawn } = await import('child_process')
    const { writeFile, unlink, readFile } = await import('fs/promises')
    const { join } = await import('path')
    const { tmpdir } = await import('os')
    
    const tmp = join(tmpdir(), `${Date.now()}_${Math.random().toString(36).substring(7)}`)
    const input = `${tmp}_input`
    const output = `${tmp}_output.webp`
    
    try {
        // Escribir archivo de entrada
        await writeFile(input, img)
        
        // Comando FFmpeg corregido - usar color hexadecimal en lugar de 'transparent'
        const ffmpegArgs = [
            '-i', input,
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=#00000000',
            '-vcodec', 'libwebp',
            '-lossless', '0',
            '-q:v', quality.toString(),
            '-preset', 'default',
            '-loop', '0',
            '-an',
            '-vsync', '0',
            '-s', '512x512',
            output
        ]
        
        return new Promise((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', ffmpegArgs, {
                stdio: ['pipe', 'pipe', 'pipe']
            })
            
            let stderr = ''
            
            ffmpeg.stderr.on('data', (data) => {
                stderr += data.toString()
            })
            
            ffmpeg.on('close', async (code) => {
                try {
                    if (code === 0) {
                        const result = await readFile(output)
                        
                        // Limpiar archivos temporales
                        await unlink(input).catch(() => {})
                        await unlink(output).catch(() => {})
                        
                        resolve(result)
                    } else {
                        console.error('FFmpeg stderr:', stderr)
                        
                        // Limpiar archivos temporales
                        await unlink(input).catch(() => {})
                        await unlink(output).catch(() => {})
                        
                        reject(new Error(`FFmpeg falló con código ${code}`))
                    }
                } catch (error) {
                    reject(error)
                }
            })
            
            ffmpeg.on('error', (error) => {
                reject(error)
            })
        })
        
    } catch (error) {
        // Limpiar archivos en caso de error
        await unlink(input).catch(() => {})
        await unlink(output).catch(() => {})
        throw error
    }
}
