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
      .catch(() => 'http://imgfz.com/i/4FxeQNH.gif')

    // Preparar el tag del usuario
    const userId = m.sender.split('@')[0]
    let taguser = `@${userId}`
    let phone = PhoneNumber('+' + userId)
    let pais = phone.getRegionCode() || 'Desconocido 🌐'

    const vids = [
      'https://s8.ezgif.com/tmp/ezgif-83c9712edcb0df.mp4',
      'https://s8.ezgif.com/tmp/ezgif-83c9712edcb0df.mp4',
      'https://s8.ezgif.com/tmp/ezgif-83c9712edcb0df.mp4'
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
          thumbnailUrl: 'http://imgfz.com/i/4FxeQNH.gif',
          sourceUrl: '120363386229166956@newsletter',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }

    let saludo
    let hora = new Date().getUTCHours() - 6
    if (hora < 0) hora += 24

    if (hora >= 5 && hora < 13) {
      saludo = '✨️ Hola que tengas un lindo día ❤️'
    } else if (hora >= 13 && hora < 18) {
      saludo = 'Buenas tardes,que se te ofrece '
    } else {
      saludo = '🍭 ¿Por qué aún no duermes? 🥱'
    }

    // Definir la fecha para evitar error
    const date = new Date().toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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
🕷️┝⎆ [ ${usedPrefix}spotify <canción> - Buscar en Spotify
◈┄──━━┉─࿂

◈───≼ 🕸️ _*BUSCADORES*_ 🕸️ ≽──⊚
🕷️┝⎆ [ ${usedPrefix}yts <nombre> - Buscar en YouTube           
🕷️┝⎆ [ ${usedPrefix}pinterest <texto> - Buscar imágenes
🕷️┝⎆ [ ${usedPrefix}aptoide <app> - Buscar APK
🕸️┝⎆ [ ${usedPrefix}tiktoksearch <texto> - Buscar en TT
🕷️┝⎆ [ ${usedPrefix}ssweb <texto> - Buscar páginas
◈┄──━━┉─࿂

◈───≼ ⚰️ _*ADMINS*_ ⚰️ ≽──⊚                                     
🩸┝⎆ [ ${usedPrefix}ht <texto> - Mención masiva
🩸┝⎆ [ ${usedPrefix}advertencia <@tag> <texto> - Advertencia
🧟┝⎆ [ ${usedPrefix}perfil - Ver perfil grupo
🕸️┝⎆ [ ${usedPrefix}g - Cerrar grupo
🕸️┝⎆ [ ${usedPrefix}g - Abrir grupo
🕷️┝⎆ [ ${usedPrefix}tagall - Mencionar a todos
🕷️┝⎆ [ ${usedPrefix}setppgrupo <img> - Cambiar foto grupo
🩸┝⎆ [ ${usedPrefix}k <@tag> - Expulsar miembro
🕷️┝⎆ [ ${usedPrefix}tag <mensaje> - Etiquetar con mensaje      
🩸┝⎆ [ ${usedPrefix}del - Eliminar mensaje
🩸┝⎆ [ ${usedPrefix}p <@tag> - Dar admin
🩸┝⎆ [ ${usedPrefix}d <@tag> - Quitar admin
🧟‍♂️┝⎆ [ ${usedPrefix}autoadmin - El bot te da admin
☠️┝⎆ [ ${usedPrefix}banuser @tag - Banea al etiquetado
✨┝⎆ [ ${usedPrefix}unbanuser @tag - Desbanea al etiquetado
👁️‍🗨️┝⎆ [ ${usedPrefix}detect on/off - Detecta acciones hechas por admins
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
🕷️┝⎆ [ ${usedPrefix}ai <texto> - Chat IA
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

    // Enviar el menú con video y menciones
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: body,
      gifPlayback: true,
      mentions: [m.sender],
      ...metaMsg
    })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: `✘ Error al enviar el menú: ${e.message}`,
      mentions: [m.sender]
    }, {
      quoted: metaMsg
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
