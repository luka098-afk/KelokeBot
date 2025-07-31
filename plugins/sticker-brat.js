import { sticker } from '../lib/sticker.js'
import axios from 'axios'

// Definir emojis y variables
const emoji = "✨";
const rwait = "⏳";
const done = "✅";
const error = "❌";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetchSticker = async (text, attempt = 1) => {
    try {
        console.log(`🎨 Generando brat sticker: "${text}" (intento ${attempt})`)
        
        const response = await axios.get(`https://api.hanggts.xyz/imagecreator/brat`, {
            params: { text },
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })
        
        if (!response.data || response.data.length === 0) {
            throw new Error('Respuesta vacía del servidor')
        }
        
        console.log(`✅ Imagen brat descargada: ${response.data.length} bytes`)
        return Buffer.from(response.data)
        
    } catch (err) {
        console.error(`❌ Error en intento ${attempt}:`, err.message)
        
        if (err.response?.status === 429 && attempt <= 3) {
            const retryAfter = err.response.headers['retry-after'] || 5
            console.log(`🚫 Rate limit alcanzado, esperando ${retryAfter} segundos...`)
            await delay(retryAfter * 1000)
            return fetchSticker(text, attempt + 1)
        }
        
        if (err.code === 'ECONNABORTED' && attempt <= 2) {
            console.log(`⏰ Timeout, reintentando en ${attempt * 2} segundos...`)
            await delay(attempt * 2000)
            return fetchSticker(text, attempt + 1)
        }
        
        throw err
    }
}

let handler = async (m, { conn, text }) => {
    // Obtener texto del mensaje citado o del comando
    if (m.quoted && m.quoted.text) {
        text = m.quoted.text.trim()
    } else if (!text) {
        return conn.sendMessage(m.chat, {
            text: `${emoji} *Brat Sticker Generator*\n\n` +
                  `📝 *Uso:* .brat <texto>\n` +
                  `💡 *Ejemplo:* .brat hola mundo\n` +
                  `🔄 *También puedes responder a un mensaje*`,
        }, { quoted: m })
    }

    // Validar longitud del texto
    if (text.length > 100) {
        return conn.sendMessage(m.chat, {
            text: `⚠️ El texto es demasiado largo. Máximo 100 caracteres.\nActual: ${text.length}/100`,
        }, { quoted: m })
    }

    // Reaccionar con emoji de espera
    await m.react(rwait)

    let stickerBuffer = null

    try {
        // Descargar la imagen brat
        console.log('🔄 Descargando imagen brat...')
        const imageBuffer = await fetchSticker(text.trim())
        
        if (!imageBuffer || !Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
            throw new Error('No se pudo descargar la imagen brat')
        }

        // Obtener configuración del usuario
        let userId = m.sender
        let packstickers = global.db?.data?.users?.[userId] || {}
        let packname = packstickers.text1 || global.packsticker || 'Brat Sticker'
        let author = packstickers.text2 || global.packsticker2 || 'Bot'

        console.log(`🔄 Convirtiendo a sticker con pack: "${packname}" - "${author}"`)

        // Convertir a sticker usando nuestra librería mejorada
        stickerBuffer = await sticker(imageBuffer, false, packname, author)

        if (!stickerBuffer || !Buffer.isBuffer(stickerBuffer) || stickerBuffer.length === 0) {
            throw new Error("No se pudo convertir a sticker")
        }

        console.log(`✅ Sticker brat creado: ${stickerBuffer.length} bytes`)

        // Enviar sticker directamente desde memoria (sin guardar archivos)
        await conn.sendMessage(m.chat, {
            sticker: stickerBuffer
        }, { quoted: m })

        await m.react(done)

    } catch (err) {
        console.error('❌ Error completo en handler:', err)
        await m.react(error)

        let errorMsg = "⚠️ Ocurrió un error al generar el sticker brat."

        // Mensajes de error específicos
        if (err.message.includes('timeout') || err.code === 'ECONNABORTED') {
            errorMsg = "⏰ Tiempo de espera agotado. Intenta de nuevo."
        } else if (err.message.includes('429') || err.response?.status === 429) {
            errorMsg = "🚫 Demasiadas solicitudes. Espera un momento e intenta de nuevo."
        } else if (err.message.includes('500') || err.response?.status >= 500) {
            errorMsg = "🔧 Error del servidor de brat. Intenta de nuevo más tarde."
        } else if (err.message.includes('network') || err.code === 'ENOTFOUND') {
            errorMsg = "🌐 Error de conexión. Verifica tu internet."
        } else if (err.message.includes('FFmpeg')) {
            errorMsg = "🔧 Error de conversión. El servidor brat podría estar enviando un formato inválido."
        } else if (err.message.includes('Respuesta vacía')) {
            errorMsg = "📭 El servidor brat no devolvió ninguna imagen. Intenta con otro texto."
        }

        return conn.sendMessage(m.chat, {
            text: `${errorMsg}\n\n*Texto usado:* "${text}"\n*Error técnico:* ${err.message}`,
        }, { quoted: m })
    }
}

handler.command = ['brat']
handler.tags = ['sticker']
handler.help = ['brat *<texto>*']
handler.limit = true
handler.register = true

export default handler
