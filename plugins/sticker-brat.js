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
        console.log(`Intentando generar sticker brat: "${text}" (intento ${attempt})`)
        
        const response = await axios.get(`https://api.hanggts.xyz/imagecreator/brat`, {
            params: { text },
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })
        
        if (!response.data || response.data.length === 0) {
            throw new Error('Respuesta vacía del servidor')
        }
        
        console.log(`Sticker generado exitosamente, tamaño: ${response.data.length} bytes`)
        return response.data
        
    } catch (error) {
        console.error(`Error en intento ${attempt}:`, error.message)
        
        if (error.response?.status === 429 && attempt <= 3) {
            const retryAfter = error.response.headers['retry-after'] || 5
            console.log(`Rate limit alcanzado, esperando ${retryAfter} segundos...`)
            await delay(retryAfter * 1000)
            return fetchSticker(text, attempt + 1)
        }
        
        if (error.code === 'ECONNABORTED' && attempt <= 2) {
            console.log(`Timeout, reintentando en ${attempt * 2} segundos...`)
            await delay(attempt * 2000)
            return fetchSticker(text, attempt + 1)
        }
        
        throw error
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

    try {
        const buffer = await fetchSticker(text.trim())
        
        // Obtener configuración del usuario
        let userId = m.sender
        let packstickers = global.db?.data?.users?.[userId] || {}
        let texto1 = packstickers.text1 || global.packsticker || 'Brat Sticker'
        let texto2 = packstickers.text2 || global.packsticker2 || 'Bot'

        console.log(`Convirtiendo a sticker con pack: "${texto1}" - "${texto2}"`)
        
        let stiker = await sticker(buffer, false, texto1, texto2)

        if (stiker && stiker.length > 0) {
            await conn.sendFile(m.chat, stiker, 'brat.webp', '', m)
            await m.react(done)
        } else {
            throw new Error("No se pudo convertir a sticker")
        }
        
    } catch (err) {
        console.error('Error completo en handler:', err)
        await m.react(error)
        
        let errorMsg = "⚠️ Ocurrió un error al generar el sticker."
        
        if (err.message.includes('timeout')) {
            errorMsg = "⏰ Tiempo de espera agotado. Intenta de nuevo."
        } else if (err.message.includes('429')) {
            errorMsg = "🚫 Demasiadas solicitudes. Espera un momento e intenta de nuevo."
        } else if (err.message.includes('500')) {
            errorMsg = "🔧 Error del servidor. Intenta de nuevo más tarde."
        } else if (err.message.includes('network')) {
            errorMsg = "🌐 Error de conexión. Verifica tu internet."
        }
        
        return conn.sendMessage(m.chat, {
            text: `${errorMsg}\n\n*Detalles:* ${err.message}`,
        }, { quoted: m })
    }
}

handler.command = ['brat']
handler.tags = ['sticker']
handler.help = ['brat *<texto>*']
handler.limit = true
handler.register = true

export default handler
