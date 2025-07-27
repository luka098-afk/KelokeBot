import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import { promises as fsPromises } from 'fs'
import { join } from 'path'
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn, usedPrefix, __dirname, participants }) => {
  try {
    await m.react('✨️')

    let { exp, bank, registered } = global.db.data.users[m.sender]
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let groupUserCount = m.isGroup ? participants.length : '-'

    let perfil = await conn.profilePictureUrl(conn.user.jid, 'image')
      .catch(() => 'http://imgfz.com/i/qIWYzCa.jpeg')

    // Preparar el tag del usuario
    const userId = m.sender.split('@')[0]
    let taguser = `@${userId}`
    let phone = PhoneNumber('+' + userId)
    let pais = phone.getRegionCode() || 'Desconocido 🌐'

    const vids = [
      'https://files.cloudkuimages.guru/videos/RhnYWAae.mp4',
      'https://files.cloudkuimages.guru/videos/RhnYWAae.mp4',
      'https://files.cloudkuimages.guru/videos/RhnYWAae.mp4'
    ]
    let videoUrl = vids[Math.floor(Math.random() * vids.length)]

    const header = [
      `╔═━★•°*"'*°•★━═╗`,
      `    ✦ ꧁𝐖𝐞𝐥𝐜𝐨𝐦𝐞꧂ ✦`,
      `╚═━★•°*"'*°•★━═╝`
    ].join('\n')

    const user = global.db.data.users[m.sender] || {};
    const country = user.country || '';
    const isPremium = user.premium || false;


    const channelRD = { 
      id: '120363404278828828@newsletter', 
      name: 'Grupo oficial:'
    }


    const metaMsg = {
      quoted: global.fakeMetaMsg,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: channelRD.name
        },
        externalAdReply: {
          title: '𝗞𝗲𝗹𝗼𝗸𝗲𝗕𝗼𝘁',
          body: '© 𝑃𝑜𝑤𝑒𝑟𝑒𝑑 𝐵𝑦 G',
          mediaUrl: null,
          description: null,
          previewType: "PHOTO",
          thumbnailUrl: 'http://imgfz.com/i/qIWYzCa.jpeg',
          sourceUrl: '-',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

let saludo
let hora = new Date().getUTCHours() - 6 

if (hora < 0) hora += 24 // por si queda en negativo

if (hora >= 5 && hora < 13) {
  saludo = '✨️ Hola que tengas un lindo día ❤️'
} else if (hora >= 13 && hora < 18) {
  saludo = '✨️ Buenas tardes,que se te ofrece 💖'
} else {
  saludo = '🍭 ¿Por qué aún no duermes? 🥱'
}

    const body = `
🎀 Bienvenido a 𝗞𝗲𝗹𝗼𝗸𝗲𝗕𝗼𝘁
${saludo}, *${taguser}*!
────────────────
✨ I N F O R M A C I Ó N ✨
· › 🌺 Nombre del Bot: 𝗞𝗲𝗹𝗼𝗸𝗲𝗕𝗼𝘁 
· › 👤 Nombre de Usuario: *${taguser}*
· › 🍡 Estado: En desarrollo
· › 🍒 *Tiempo en línea* :: *${uptime}*
────────────────
*【𝕷 𝖎 𝖘 𝖙 𝖆 - 𝕯𝖊 - 𝕮 𝖔 𝖒 𝖆 𝖓 𝖉 𝖔 𝖘】*
◈───≼ _*DESCARGAS*_ ≽──⊚
┝⎆ [ ${usedPrefix}ᴛɪᴋᴛᴏᴋ <link> - Descargar video TT
┝⎆ [ ${usedPrefix}ᴘʟᴀʏ <nombre> - Descargar canción
┝⎆ [ ${usedPrefix}ᴘɪɴᴅʟ <link> - Descargar imagen Pinterest
┝⎆ [ ${usedPrefix}ɪɴsᴛᴀɢʀᴀᴍ <link> - Descargar de IG
┝⎆ [ ${usedPrefix}ꜰᴀᴄᴇʙᴏᴏᴋ <link> - Descargar video FB
┝⎆ [ ${usedPrefix}sᴘᴏᴛɪꜰʏ <canción> - Buscar en Spotify
◈┄──━━┉─࿂
◈───≼ _*BUSCADORES*_ ≽──⊚
┝⎆ [ ${usedPrefix}ʏᴛs <nombre> - Buscar en YouTube
┝⎆ [ ${usedPrefix}ᴘɪɴᴛᴇʀᴇsᴛ <texto> - Buscar imágenes
┝⎆ [ ${usedPrefix}ᴀᴘᴛᴏɪᴅᴇ <app> - Buscar APK
┝⎆ [ ${usedPrefix}ᴛɪᴋᴛᴏᴋsᴇᴀʀᴄʜ <texto> - Buscar en TT
┝⎆ [ ${usedPrefix}sꜱᴡᴇʙ <texto> - Buscar páginas
◈┄──━━┉─࿂
◈───≼ _*ADMINS*_ ≽──⊚
┝⎆ [ ${usedPrefix}ht <texto> - Mención masiva
┝⎆ [ ${usedPrefix}ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀ <@tag> <texto> - Advertencia
┝⎆ [ ${usedPrefix}ᴘᴇʀғɪʟ - Ver perfil grupo
┝⎆ [ ${usedPrefix}ɢ - Cerrar grupo
┝⎆ [ ${usedPrefix}ɢ - Abrir grupo
┝⎆ [ ${usedPrefix}tagall - Mencionar a todos
┝⎆ [ ${usedPrefix}sᴇᴛᴘᴘɢʀᴜᴘᴏ <img> - Cambiar foto grupo
┝⎆ [ ${usedPrefix}ᴋ <@tag> - Expulsar miembro
┝⎆ [ ${usedPrefix}ᴛᴀɢ - Etiquetar con mensaje
┝⎆ [ ${usedPrefix}ᴅᴇʟ - Eliminar mensaje
detect on/off detecta cualquier cosa hecha por admins.
┝⎆ [ ${usedPrefix}ᴘ <@tag> - dar admin
┝⎆ [ ${usedPrefix}ᴅ <@tag> - quitar admin
◈┄──━━┉─࿂
◈───≼ _*OWNER*_ ≽──⊚
┝⎆ [ ${usedPrefix}ʀᴇɪɴɪᴄɪᴀʀ - Reiniciar bot
┝⎆ [ ${usedPrefix}ᴅsᴏᴡɴᴇʀ - Info del dev
┝⎆ [ ${usedPrefix}sᴇᴛɴᴀᴍᴇ <nombre> - Cambiar nombre bot
┝⎆ [ ${usedPrefix}sᴇᴛᴘᴘ <img> - Cambiar foto bot
┝⎆ [ ${usedPrefix}ʀᴇsᴛᴀʀᴛ - Reinicio manual
┝⎆ [ ${usedPrefix}ᴜᴘᴅᴀᴛᴇ - Actualizar bot
◈┄──━━┉─࿂
◈───≼ _*HERRAMIENTAS*_ ≽──⊚
┝⎆ [ ${usedPrefix}s <img> - Crear sticker
┝⎆ [ ${usedPrefix}ʙʀᴀᴛ <texto> - Sticker brat style
┝⎆ [ ${usedPrefix}ɪǫᴄ <texto> - Buscar info IQ
┝⎆ [ ${usedPrefix}ʀᴠᴏᴄᴀʟ <audio> - Cambiar voz
┝⎆ [ ${usedPrefix}ᴛᴏᴜʀʟ2 <img> - Convertir en URL
┝⎆ [ ${usedPrefix}ʜᴅ <imagen> - Mejorar calidad
┝⎆ [ ${usedPrefix}ᴛᴏᴜʀʟ <imagen> - Imagen a enlace
◈┄──━━┉─࿂
◈───≼ _*FUN*_ ≽──⊚
┝⎆ [ ${usedPrefix}ᴋɪss - Enviar beso
┝⎆ [ ${usedPrefix}ᴛᴏᴘ <texto> - Ranking divertido
┝⎆ [ ${usedPrefix}ɢᴀʏ - Porcentaje gay
┝⎆ [ ${usedPrefix}ᴘᴀᴊᴇᴀᴍᴇ - Joda sexual
┝⎆ [ ${usedPrefix}ᴅᴏxᴇᴏ @usuario - Info falsa divertida
┝⎆ [ ${usedPrefix}ᴅᴏxiing @usuario - Doxeo random
┝⎆ [ ${usedPrefix}ғᴏʀᴍᴀʀᴘᴀʀᴇᴊᴀ - Crea una pareja
┝⎆ [ ${usedPrefix}ғᴏʀᴍᴀʀᴘᴀʀᴇᴊᴀ𝟻 - Crea pareja 5.0
◈┄──━━┉─࿂
◈───≼ _*MAIN & RPG*_ ≽──⊚
┝⎆ [ ${usedPrefix}ʀᴇɢ <nombre edad> - Registrarse
┝⎆ [ ${usedPrefix}ᴜɴʀᴇɢ - Borrar registro
┝⎆ [ ${usedPrefix}ᴍᴇɴᴜ - Ver el menú principal
┝⎆ [ ${usedPrefix}ᴊᴜᴇɢᴏs - Juegos disponibles
┝⎆ [ ${usedPrefix}ᴘɪɴɢ - Velocidad del bot
┝⎆ [ ${usedPrefix}ɢʀᴜᴘᴏs - Lista de grupos
┝⎆ [ ${usedPrefix}ᴏᴡɴᴇʀ - Info del owner
◈┄──━━┉─࿂
◈───≼ _*IA & ARTE*_ ≽──⊚
┝⎆ [ ${usedPrefix}ᴍᴀɢɪᴄsᴛᴜᴅɪᴏ <texto> - Generar imagen
┝⎆ [ ${usedPrefix}ᴀɪ <texto> - Chat IA
┝⎆ [ ${usedPrefix}ᴇᴅɪᴛꜰᴏᴛᴏ <descripción> - Editar foto IA
┝⎆ [ ${usedPrefix}ᴡᴘᴡ - Wallpaper random
┝⎆ [ ${usedPrefix}ɢᴇᴍɪɴɪ <texto> - Gemini IA
┝⎆ [ ${usedPrefix}ʙɢʀᴇᴍᴏᴠᴇʀ <imagen> - Quitar fondo
◈┄──━━┉─࿂
◈───≼ _*NSFW*_ ≽──⊚
┝⎆ [ ${usedPrefix}ᴘᴇɴᴇᴛʀᴀʀ - Acción explícita
┝⎆ [ ${usedPrefix}ʜᴜᴇᴠᴏ - Agarrarle el huevo a alguien
┝⎆ [ ${usedPrefix}sᴇxᴏ - Acción sexual
┝⎆ [ ${usedPrefix}ᴠɪᴏʟᴀʀ - Contenido fuerte
┝⎆ [ ${usedPrefix}ғᴏʟʟᴀʀ - Simulación sexual
◈┄──━━┉─࿂

`.trim()

    // Unir header + body
    const menu = `${header}\n${body}`

    // Configurar datos para el mensaje
    const botname = '🌸◌*̥𝗞𝗲𝗹𝗼𝗸𝗲𝗕𝗼𝘁'
    const textbot = '💖 𝗞𝗲𝗹𝗼𝗸𝗲𝗕𝗼𝘁 𝘽𝙔 𝘿𝙀𝙑 G ✨️'
    const banner = perfil
    const redes = 'https://whatsapp.com/channel/0029VawwvsW7j6g1upS0i531'
    
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: body,
      gifPlayback: true,
      mentions: [m.sender],  // Agregamos el array de menciones
      ...metaMsg
    })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { 
      text: `✘ Error al enviar el menú: ${e.message}`,
      mentions: [m.sender]  // También incluimos menciones en el mensaje de error
    }, { 
      quoted: metaMsg 
    })
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu','help','menú','allmenu','menucompleto']
handler.register = true
export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
