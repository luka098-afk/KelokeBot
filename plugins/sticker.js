import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {

  // Definir variables que podrían no estar definidas
  let fake = {
    contextInfo: {
      mentionedJid: [m.sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363386229166956@newsletter',
        newsletterName: '🎃holaaaaaa🎃',
        serverMessageId: 143
      }
    }
  }

  // Definir variables globales si no existen
  let redes = global.redes || ''
  let icons = global.icons || null
  let packname = global.packname || global.packsticker || '🎃Keloke Stickers'
  let author = global.packsticker2 || global.author || '🎃 Halloween Bot'
  let rcanal = global.rcanal || fake

  let stickerBuffer = null
  
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    
    if (/webp|image|video/g.test(mime)) {
      // Verificar duración del video
      if (/video/g.test(mime)) {
        const duration = (q.msg || q).seconds || 0
        if (duration > 8) {
          return m.reply(`🎃 *¡El video no puede durar más de 8 segundos!*\n📱 *Duración actual:* ${duration}s`)
        }
      }

      console.log(`🔍 Procesando archivo: ${mime}`)
      
      // Reaccionar con emoji de procesamiento
      await m.react('⏳')

      // Descargar archivo con mejor manejo de errores
      let mediaBuffer
      try {
        mediaBuffer = await q.download?.()
        console.log(`📥 Archivo descargado: ${mediaBuffer ? mediaBuffer.length : 0} bytes`)
      } catch (downloadError) {
        console.error('❌ Error de descarga:', downloadError.message)
        await m.react('❌')
        return m.reply('🎃 Error al descargar el archivo. Intenta de nuevo.')
      }

      if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer) || mediaBuffer.length === 0) {
        await m.react('❌')
        return conn.reply(m.chat, `🎃 𝙋𝙤𝙧 𝙁𝙖𝙫𝙤𝙧, 𝙚𝙣𝙫𝙞𝙖 𝙪𝙣𝙖 𝙞𝙢𝙖𝙜𝙚𝙣 𝙤 𝙫𝙞𝙙𝙚𝙤 𝙫á𝙡𝙞𝙙𝙤 𝙥𝙖𝙧𝙖 𝙝𝙖𝙘𝙚𝙧 𝙪𝙣 𝙨𝙩𝙞𝙘𝙠𝙚𝙧 🦇`, m, rcanal)
      }

      // Intentar crear el sticker
      try {
        console.log('🔄 Creando sticker...')
        stickerBuffer = await sticker(mediaBuffer, false, packname, author)
        console.log(`✅ Sticker creado: ${stickerBuffer ? stickerBuffer.length : 0} bytes`)
        
      } catch (stickerError) {
        console.error('❌ Error creando sticker:', stickerError.message)
        await m.react('❌')
        
        // Mensajes de error específicos
        let errorMsg = '🎃 Error al procesar el archivo.'
        
        if (stickerError.message.includes('FFmpeg')) {
          errorMsg = '🔧 Error de conversión. Verifica que el archivo sea válido.'
        } else if (stickerError.message.includes('timeout')) {
          errorMsg = '⏰ El proceso tardó demasiado. Intenta con un archivo más pequeño.'
        } else if (stickerError.message.includes('not supported')) {
          errorMsg = '📁 Formato de archivo no soportado.'
        }
        
        return m.reply(`${errorMsg}\n\n*Detalles técnicos:* ${stickerError.message}`)
      }
      
    } else if (args[0]) {
      // Procesar URL
      if (isUrl(args[0])) {
        console.log('🌐 Procesando URL:', args[0])
        await m.react('⏳')
        
        try {
          // Para URLs no usamos la librería, sino que llamamos directamente
          stickerBuffer = await createStickerFromUrl(args[0], packname, author)
          console.log(`✅ Sticker desde URL: ${stickerBuffer ? stickerBuffer.length : 0} bytes`)
        } catch (urlError) {
          console.error('❌ Error con URL:', urlError.message)
          await m.react('❌')
          return m.reply('🎃 Error al procesar la URL. Verifica que sea una imagen válida.')
        }
      } else {
        return m.reply(`⚠️ El URL es incorrecto. Debe ser una imagen válida (jpg, png, gif, webp)`)
      }
    }
    
  } catch (e) {
    console.error('❌ Error general en handler:', e)
    await m.react('❌')
    stickerBuffer = null
  }

  // Enviar resultado
  if (stickerBuffer && Buffer.isBuffer(stickerBuffer) && stickerBuffer.length > 0) {
    try {
      // Enviar el sticker directamente desde el buffer en memoria
      await conn.sendMessage(m.chat, {
        sticker: stickerBuffer
      }, { quoted: m })
      
      // Mensaje adicional con info (opcional)
      await conn.sendMessage(m.chat, {
        text: `✅ *Sticker creado exitosamente*\n📦 *Tamaño:* ${formatBytes(stickerBuffer.length)}\n🏷️ *Pack:* ${packname}`,
        contextInfo: {
          externalAdReply: {
            showAdAttribution: false,
            title: packname,
            body: `🎃 Keloke 👻`,
            mediaType: 1,
            sourceUrl: redes,
            thumbnail: icons
          }
        }
      }, { quoted: m })
      
      await m.react('✅')
      
    } catch (sendError) {
      console.error('❌ Error enviando sticker:', sendError.message)
      await m.react('❌')
      return m.reply('🎃 Error al enviar el sticker. Intenta de nuevo.')
    }
    
  } else {
    await m.react('❌')
    return conn.reply(m.chat, `╭━〔 🎃 𝗦𝗽𝗼𝗼𝗸𝘆 𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗧𝗶𝗺𝗲!  👻 〕━⬣
┃
┃ 🦇 🔖 𝑯𝒐𝒍𝒂, 𝒏𝒆𝒄𝒆𝒔𝒊𝒕𝒐 𝒖𝒏𝒂 𝒊𝒎𝒂𝒈𝒆𝒏 𝒐 𝒗𝒊𝒅𝒆𝒐
┃ 🕷️ 𝒑𝒂𝒓𝒂 𝒄𝒓𝒆𝒂𝒓 𝒕𝒖 𝒔𝒕𝒊𝒄𝒌𝒆𝒓 𝒆𝒔𝒑𝒆𝒍𝒖𝒛𝒏𝒂𝒏𝒕𝒆 🎨
┃
┃ 📝 *Formatos soportados:*
┃ • Imágenes: JPG, PNG, GIF, WebP
┃ • Videos: MP4 (máx 8 segundos)
┃ • URLs de imágenes
┃
┃ 💡 *Uso:* ${usedPrefix + command} <responde a imagen/video>
┃ 🌐 *URL:* ${usedPrefix + command} <enlace>
┃
╰━━━━━━━━━━━━━━━━━━⬣`, m, fake)
  }
}

/**
 * Create sticker from URL (placeholder)
 * @param {string} url 
 * @param {string} packname 
 * @param {string} author 
 * @returns {Promise<Buffer>}
 */
async function createStickerFromUrl(url, packname, author) {
  // Esta función necesitaría implementar descarga de URL
  // Por ahora lanzamos error para que use otros métodos
  throw new Error('URL processing not fully implemented yet')
}

/**
 * Format bytes to human readable
 * @param {number} bytes 
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

handler.help = ['stiker <img>', 'sticker <url>']
handler.tags = ['sticker']
handler.group = false
handler.register = true
handler.command = ['s', 'sticker', 'stiker']
handler.limit = true

export default handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|webp)/, 'gi'))
}
