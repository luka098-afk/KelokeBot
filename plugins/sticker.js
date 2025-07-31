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

  let stiker = false
  
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

      console.log(`Procesando archivo: ${mime}`)
      
      // Descargar archivo con mejor manejo de errores
      let img
      try {
        img = await q.download?.()
        console.log(`Archivo descargado: ${img ? img.length : 0} bytes`)
      } catch (downloadError) {
        console.error('Error de descarga:', downloadError.message)
        return m.reply('🎃 Error al descargar el archivo. Intenta de nuevo.')
      }

      if (!img || !Buffer.isBuffer(img) || img.length === 0) {
        return conn.reply(m.chat, `🎃 𝙋𝙤𝙧 𝙁𝙖𝙫𝙤𝙧, 𝙚𝙣𝙫𝙞𝙖 𝙪𝙣𝙖 𝙞𝙢𝙖𝙜𝙚𝙣 𝙤 𝙫𝙞𝙙𝙚𝙤 𝙫á𝙡𝙞𝙙𝙤 𝙥𝙖𝙧𝙖 𝙝𝙖𝙘𝙚𝙧 𝙪𝙣 𝙨𝙩𝙞𝙘𝙠𝙚𝙧 🦇`, m, rcanal)
      }

      // Reaccionar con emoji de procesamiento
      await m.react('⏳')

      // Intentar crear el sticker directamente primero
      try {
        console.log('Intentando conversión directa...')
        stiker = await sticker(img, false, packname, author)
        console.log(`Sticker creado directamente: ${stiker ? stiker.length : 0} bytes`)
        
      } catch (directError) {
        console.error('Error en conversión directa:', directError.message)
        
        // Si la conversión directa falla, intentar métodos alternativos
        console.log('Intentando métodos alternativos...')
        
        try {
          let processedImg = img
          
          // Procesar según el tipo de archivo
          if (/webp/g.test(mime)) {
            console.log('Procesando WebP...')
            try {
              processedImg = await webp2png(img)
              console.log('WebP convertido a PNG')
            } catch (webpError) {
              console.log('Error en webp2png, usando imagen original')
              processedImg = img
            }
          }
          
          // Intentar nuevamente con la imagen procesada
          stiker = await sticker(processedImg, false, packname, author)
          console.log(`Sticker creado con imagen procesada: ${stiker ? stiker.length : 0} bytes`)
          
        } catch (processedError) {
          console.error('Error con imagen procesada:', processedError.message)
          
          // Último intento: subir imagen y usar URL
          try {
            console.log('Último intento: subiendo imagen...')
            let uploadedUrl
            
            if (/image/g.test(mime)) {
              uploadedUrl = await uploadImage(img)
            } else if (/video/g.test(mime)) {
              uploadedUrl = await uploadFile(img)
            } else {
              uploadedUrl = await uploadImage(img)
            }
            
            if (uploadedUrl && typeof uploadedUrl === 'string') {
              console.log('Imagen subida, creando sticker desde URL...')
              stiker = await sticker(false, uploadedUrl, packname, author)
              console.log(`Sticker creado desde URL: ${stiker ? stiker.length : 0} bytes`)
            }
            
          } catch (uploadError) {
            console.error('Error en upload:', uploadError.message)
            throw new Error('No se pudo procesar el archivo con ningún método')
          }
        }
      }
      
    } else if (args[0]) {
      // Procesar URL
      if (isUrl(args[0])) {
        console.log('Procesando URL:', args[0])
        await m.react('⏳')
        
        try {
          stiker = await sticker(false, args[0], packname, author)
          console.log(`Sticker creado desde URL: ${stiker ? stiker.length : 0} bytes`)
        } catch (urlError) {
          console.error('Error con URL:', urlError.message)
          return m.reply('🎃 Error al procesar la URL. Verifica que sea una imagen válida.')
        }
      } else {
        return m.reply(`⚠️ El URL es incorrecto. Debe ser una imagen válida (jpg, png, gif)`)
      }
    }
    
  } catch (e) {
    console.error('Error general en handler:', e)
    await m.react('❌')
    if (!stiker) stiker = false
  }

  // Enviar resultado
  if (stiker && Buffer.isBuffer(stiker) && stiker.length > 0) {
    try {
      await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, {
        contextInfo: {
          'forwardingScore': 200,
          'isForwarded': false,
          externalAdReply: {
            showAdAttribution: false,
            title: packname,
            body: `🎃 Keloke 👻`,
            mediaType: 2,
            sourceUrl: redes,
            thumbnail: icons
          }
        }
      }, { quoted: m })
      
      await m.react('✅')
      
    } catch (sendError) {
      console.error('Error enviando sticker:', sendError.message)
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
