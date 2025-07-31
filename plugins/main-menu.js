import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'
import { promises as fsPromises } from 'fs'
import { join } from 'path'
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn, usedPrefix, __dirname, participants }) => {
  try {
    await m.react('🩸')

    // Verificar que global.db exista antes de usarlo
    if (!global.db || !global.db.data || !global.db.data.users) {
      throw new Error('Database not initialized')
    }

    // Inicializar usuario si no existe
    if (!global.db.data.users[m.sender]) {
      global.db.data.users[m.sender] = {
        exp: 0,
        bank: 0,
        registered: false
      }
    }

    let { exp, bank, registered } = global.db.data.users[m.sender]
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length
    let groupUserCount = m.isGroup ? participants.length : ''

    let perfil = await conn.profilePictureUrl(conn.user.jid, 'image')
      .catch(() => 'http://imgfz.com/i/jTobJ2i.jpeg') // AQUÍ: Pone tu URL de imagen por defecto

    // Preparar el tag del usuario
    const userId = m.sender.split('@')[0]
    let taguser = `@${userId}`
    let phone = PhoneNumber('+' + userId)
    let pais = phone.getRegionCode() || 'Desconocido 🌐'

    const vids = [
      '', // AQUÍ: Pone tus URLs de videos MP4
      '', // AQUÍ: Pone tus URLs de videos MP4
      ''  // AQUÍ: Pone tus URLs de videos MP4
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
      id: '120363386229166956@newsletter',
      name: 'Grupo oficial:'
    }

    // Objeto meta corregido
    const meta = {
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        externalAdReply: {
          title: '',
          body: '',
          mediaUrl: null,
          description: null,
          previewType: "PHOTO",
          thumbnailUrl: 'http://imgfz.com/i/jTobJ2i.jpeg', // AQUÍ: Pone tu URL de imagen para el thumbnail
          sourceUrl: 'https://whatsapp.com/channel/0029VawwvsW7j6g1upS0i531', // AQUÍ: Pone tu número de contacto o canal
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    // Calcular saludo según hora (ajustado para Uruguay UTC-3)
    let saludo
    let hora = new Date().getUTCHours() - 3 // Zona horaria de Uruguay
    if (hora < 0) hora += 24
    if (hora >= 24) hora -= 24

    if (hora >= 5 && hora < 13) {
      saludo = 'Hola que tengas un lindo día'
    } else if (hora >= 13 && hora < 18) {
      saludo = 'Buenas tardes, ¿qué se te ofrece?'
    } else {
      saludo = '¿Por qué aún no duermes? 🥱'
    }

    // Fecha formateada para Uruguay
    const date = new Date().toLocaleDateString('es-UY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Montevideo'
    })

    const body = `
Bienvenido a 𝗞𝗲𝗹𝗼𝗸𝗲𝗕𝗼𝘁
${saludo}, *${taguser}*!
╔═══════ ⛓️ 𝐊𝐞𝐥𝐨𝐤𝐞𝐁𝐨𝐭 ⛓️ ═══════╗
┃    𝙷𝚘𝚕𝚊, 𝚜𝚘𝚢 𝚝𝚞 𝚊𝚜𝚒𝚜𝚝𝚎𝚗𝚝𝚎 𝚣𝚘𝚖𝚋𝚒𝚎 🧟‍♂️    ┃
┃        Usuario: *${taguser}*         ┃
┃         Fecha: *${date}*          ┃
┃        Uptime: *${uptime}*         ┃
┃  Estado: en desarrollo oscuro... 🩸  ┃
╚═══════════════════════════════════╝
*【𝕷 𝖎 𝖘 𝖙 𝖆 - 𝕯𝖊 - 𝕮 𝖔 𝖒 𝖆 𝖓 𝖉 𝖔 𝖘】*

◈───≼ 🧟‍♀️ _*DESCARGAS*_ 🧟‍♀️ ≽──⊚
🕷️┝⎆ [ ${usedPrefix}tiktok <link> - Descargar video TT
🕷️┝⎆ [ ${usedPrefix}play <nombre> - Descargar canción
🕸️┝⎆ [ ${usedPrefix}pindl <link> - Descargar imagen Pinterest
🕷️┝⎆ [ ${usedPrefix}instagram <link> - Descargar de IG
🕷️┝⎆ [ ${usedPrefix}facebook <link> - Descargar video FB
🕷️┝⎆ [ ${usedPrefix}spotify <canción> - Descargar en Spotify
◈┄──━━┉─࿂

◈───≼ 🕸️ _*BUSCADORES*_ 🕸️ ≽──⊚
🕷️┝⎆ [ ${usedPrefix}pinterest <texto> - Buscar imágenes
🕷️┝⎆ [ ${usedPrefix}aptoide <app> - Buscar APK
🕷️┝⎆ [ ${usedPrefix}ssweb <texto> - Buscar páginas
◈┄──━━┉─࿂

◈───≼ ⚰️ _*ADMINS*_ ⚰️ ≽──⊚
🩸┝⎆ [ ${usedPrefix}ht <texto> - Mención masiva
🩸┝⎆ [ ${usedPrefix}advertencia <@tag> <texto> - Advertencia
🕸️┝⎆ [ ${usedPrefix}g - Abrir/Cerrar grupo
🕷️┝⎆ [ ${usedPrefix}tagall - Mencionar a todos
🕷️┝⎆ [ ${usedPrefix}setppgrupo <img> - Cambiar foto grupo
🩸┝⎆ [ ${usedPrefix}k <@tag> - Expulsar miembro
🩸┝⎆ [ ${usedPrefix}del - Eliminar mensaje
🩸┝⎆ [ ${usedPrefix}p <@tag> - Dar admin
🩸┝⎆ [ ${usedPrefix}d <@tag> - Quitar admin
🧟‍♂️┝⎆ [ ${usedPrefix}autoadmin - El bot te da admin
☠️┝⎆ [ ${usedPrefix}banuser @tag - Banea al etiquetado
✨┝⎆ [ ${usedPrefix}unbanuser @tag - Desbanea al etiquetado
👁️‍🗨️┝⎆ [ ${usedPrefix}detect on/off - Detecta acciones hechas por admins
🕸️┝⎆ [ ${usedPrefix}ruletaban @tag ] - 𝕽𝖚𝖑𝖊𝖙𝖆 𝕬𝖑𝖊𝖆𝖙𝖔𝖗𝖎𝖆 ☠️
🩸┝⎆ [ ${usedPrefix}link - Obtiene el link del grupo
◈┄──━━┉─࿂

◈───≼ 🧟‍♂️ _*OWNER*_ 🧟‍♂️ ≽──⊚
🕷️┝⎆ [ ${usedPrefix}reiniciar - Reiniciar bot
🕷️┝⎆ [ ${usedPrefix}dsowner - Info del dev
🕸️┝⎆ [ ${usedPrefix}setname <nombre> - Cambiar nombre bot
🕸️┝⎆ [ ${usedPrefix}setpp <img> - Cambiar foto bot
🕷️┝⎆ [ ${usedPrefix}restart - Reinicio manual
🕷️┝⎆ [ ${usedPrefix}update - Actualizar bot
◈┄──━━┉─࿂

◈───≼ 🕸️ _*HERRAMIENTAS*_ 🕸️ ≽──⊚
🩸┝⎆ [ ${usedPrefix}s <img> - Crear sticker
🩸┝⎆ [ ${usedPrefix}brat <texto> - Sticker brat style
🕷️┝⎆ [ ${usedPrefix}iqc <texto> - Buscar info IQ
🕷️┝⎆ [ ${usedPrefix}rvocal <audio> - Cambiar voz
🕷️┝⎆ [ ${usedPrefix}tourl2 <img> - Convertir en URL
🕷️┝⎆ [ ${usedPrefix}hd <imagen> - Mejorar calidad
🕷️┝⎆ [ ${usedPrefix}tourl <imagen> - Imagen a enlace
┝⎆ [ ${usedPrefix}reportar <texto> - 🕷️ Invoca a los 𝔄𝔡𝔪𝔦𝔫𝔰 del más allá 🩸
🧟┝⎆ [ ${usedPrefix}perfil - Ver perfil grupo
◈┄──━━┉─࿂

◈───≼ 🧟 _*FUN*_ 🧟 ≽──⊚
🕷️┝⎆ [ ${usedPrefix}kiss - Enviar beso
🕷️┝⎆ [ ${usedPrefix}top <texto> - Ranking divertido
🕸️┝⎆ [ ${usedPrefix}gay - Porcentaje gay
🕷️┝⎆ [ ${usedPrefix}pajeame - Joda sexual
🕷️┝⎆ [ ${usedPrefix}doxeo @usuario - Info falsa divertida
🕷️┝⎆ [ ${usedPrefix}doxiing @usuario - Doxeo random
🕸️┝⎆ [ ${usedPrefix}formarpareja - Crea una pareja
🕸️┝⎆ [ ${usedPrefix}formarpareja5 - Crea pareja 5.0
🎃┝⎆ [ ${usedPrefix}sortear - Sorteo al azar entre mortales
🩸┝⎆ [ ${usedPrefix}sorpresa - ¿quieres saber el secreto?☠️
◈┄──━━┉─࿂

◈───≼ 🕷️ _*MAIN & RPG*_ 🕷️ ≽──⊚
🩸┝⎆ [ ${usedPrefix}reg <nombre edad> - Registrarse
🩸┝⎆ [ ${usedPrefix}unreg - Borrar registro
🧟┝⎆ [ ${usedPrefix}menu - Ver el menú principal
🕷️┝⎆ [ ${usedPrefix}juegos - Juegos disponibles
🕸️┝⎆ [ ${usedPrefix}ping - Velocidad del bot
🕷️┝⎆ [ ${usedPrefix}grupos - Lista de grupos
🕷️┝⎆ [ ${usedPrefix}owner - Info del owner
◈┄──━━┉─࿂

◈───≼ 🧟‍♂️ _*IA & ARTE*_ 🧟‍♂️ ≽──⊚
🕸️┝⎆ [ ${usedPrefix}magicstudio <texto> - Generar imagen
🕷️┝⎆ [ ${usedPrefix}bot <texto> - Chat IA
🕷️┝⎆ [ ${usedPrefix}editfoto <descripción> - Editar foto IA
🕷️┝⎆ [ ${usedPrefix}wpw - Wallpaper random
🕷️┝⎆ [ ${usedPrefix}gemini <texto> - Gemini IA
🕷️┝⎆ [ ${usedPrefix}bgremover <imagen> - Quitar fondo
◈┄──━━┉─࿂

◈───≼ ☠️ _*NSFW*_ ☠️ ≽──⊚
🩸┝⎆ [ ${usedPrefix}penetrar - Acción explícita
🕸️┝⎆ [ ${usedPrefix}huevo - Agarrarle el huevo a alguien
🕷️┝⎆ [ ${usedPrefix}sexo - Acción sexual
🕷️┝⎆ [ ${usedPrefix}violar - Contenido fuerte
🕷️┝⎆ [ ${usedPrefix}follar - Simulación sexual
◈┄──━━┉─࿂
`.trim()

    // Unir header + body
    const menu = `${header}\n${body}`

    // Enviar el menú con video (si hay URL) o solo texto
    if (videoUrl && videoUrl.trim() !== '') {
      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: body,
        gifPlayback: true,
        mentions: [m.sender],
        ...meta
      })
    } else {
      await conn.sendMessage(m.chat, {
        text: body,
        mentions: [m.sender],
        ...meta
      })
    }

  } catch (e) {
    console.error(e)
    
    // Crear un body básico en caso de error
    const errorBody = `
Bienvenido a 𝗞𝗲𝗹𝗼𝗸𝗲𝗕𝗼𝘁
¡Hola! Hubo un error al cargar el menú completo.
Usa ${usedPrefix}help para ver los comandos disponibles.
    `.trim()
    
    // Si hay error, enviar menú básico
    await conn.sendMessage(m.chat, {
      text: errorBody,
      mentions: [m.sender]
    }, {
      quoted: m
    })
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'help', 'menú', 'allmenu', 'menucompleto']
handler.register = true
export default handler

function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
