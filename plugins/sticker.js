import { spawn } from 'child_process'
import { writeFile, unlink, readFile, access } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, args, usedPrefix, command, isBotAdmin, isGroup }) => {
    // 🔹 Validación: solo pide admin si es un grupo
    if (isGroup && !isBotAdmin) {
        return m.reply(`🚫 *No puedo ejecutar este comando porque no soy administrador del grupo.*\n💡 *Solución:* Hazme admin y vuelve a intentarlo.`)
    }

    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        if (!mime) {  
            throw '*Responde a una imagen, video, gif o sticker*\n\n*Ejemplo:*\n• Envía una imagen y responde con ' + usedPrefix + command  
        }  

        if (/image|video|webp/.test(mime)) {  
            if (/video/.test(mime) && (q.msg || q).seconds > 10) {  
                throw '*El video no puede durar más de 10 segundos*'  
            }  

            let img = await q.download?.()  
            if (!img) throw '❌ No se pudo descargar el archivo'  

            console.log('Descarga exitosa, creando sticker...')  

            let stiker = await createSticker(img)  

            if (stiker) {  
                try {  
                    await conn.sendMessage(m.chat, {  
                        sticker: stiker  
                    }, {  
                        quoted: m  
                    })  
                    console.log('Sticker enviado exitosamente')  
                } catch (sendError) {  
                    console.error('Error enviando con sendMessage:', sendError)  
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

async function createSticker(buffer) {
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
        await writeFile(input, buffer)  
        await access(input)  

        const ffmpegArgs = [  
            '-i', input,  
            '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',  
            '-c:v', 'libwebp',  
            '-lossless', '1',  
            '-preset', 'picture',  
            '-an',  
            '-vsync', '0',  
            '-pix_fmt', 'yuva420p',  
            '-y',  
            output  
        ]  

        await runFFmpeg(ffmpegArgs)  
        await access(output)  

        const stickerBuffer = await readFile(output)  

        await cleanup(input, output)  
        return stickerBuffer  

    } catch (error) {  
        console.error('Error en createSticker:', error)  
        await cleanup(input, output)  
        throw new Error('No se pudo crear el sticker: ' + error.message)  
    }
}

function runFFmpeg(args) {
    return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', args, {
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
                reject(new Error(`FFmpeg falló con código ${code}: ${stderr}`))  
            }  
        })  

        ffmpeg.on('error', (error) => {  
            reject(new Error(`Error ejecutando FFmpeg: ${error.message}`))  
        })  

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
        } catch {  
            // archivo no existe o ya eliminado  
        }  
    }
}
