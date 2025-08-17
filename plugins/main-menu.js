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

    // Fecha simplificada
    const date = new Date().toLocaleDateString('es-UY', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    })

    const body = `╔═══════𝐊𝐞𝐥𝐨𝐤𝐞𝐁𝐨𝐭═══════╗
┃    𝙷𝚘𝚕𝚊, 𝚜𝚘𝚢 𝚝𝚞 
┃ ㅤ𝚊𝚜𝚒𝚜𝚝𝚎𝚗𝚝𝚎 𝚣𝚘𝚖𝚋𝚒𝚎 🧟‍♂️    ┃
┃        Usuario: ${taguser}         ┃
┃         Fecha: ${date}          ┃
┃        Uptime: ${uptime}  ㅤㅤ     ┃
┃  Estado: en desarrollo... 🩸     ┃
╚════════════════════╝

╔═━━━✦•☠•✦━━━═╗
     ⚰️  M E N Ú  ⚰️
╚═━━━✦•☠•✦━━━═╝

【𝕷 𝖎 𝖘 𝖙 𝖆 - 𝕯𝖊 - 𝕮 𝖔 𝖒 𝖆 𝖓 𝖉 𝖔 𝖘

⛧ ${usedPrefix}idea <texto>  
✞ *Envía tu idea a los owners o reporta algun error* ✞ 

༺═──────────────═༻
⛧ 𝕬𝖉𝖒𝖎𝖓𝖘 𝕯𝖊𝖑 𝕮𝖔𝖓𝖏𝖚𝖗𝖔 ⚒️
༺═──────────────═༻
🕷️➤ ${usedPrefix}warn *<@tag> - Advertir*
🕷️➤ ${usedPrefix}unwarn *<@tag> - Quitar advertencia*
🕷️➤ ${usedPrefix}listadv *- Ver advertencias*
🕷️➤ ${usedPrefix}mute *- Silenciar*
🕷️➤ ${usedPrefix}unmute *- Quitar silencio*
🕷️➤ ${usedPrefix}ht *<txt> - Mención masiva*
🕷️➤ ${usedPrefix}g *- Abrir/Cerrar grupo*
🕸️➤ ${usedPrefix}tagall *- Llamar a todos*
🕷️➤ ${usedPrefix}setppgrupo *<img> - Foto grupo*
🕷️➤ ${usedPrefix}k *<@tag> - Expulsar*
🕷️➤ ${usedPrefix}del *- Borrar mensaje*
🕷️➤ ${usedPrefix}p *<@tag> - Dar admin*
🕷️➤ ${usedPrefix}d *<@tag> - Quitar admin*
🕷️➤ ${usedPrefix}autoadmin *- Bot te da admin*
🕷️➤ ${usedPrefix}banuser *<@tag> - Banear*
🕷️➤ ${usedPrefix}unbanuser *<@tag> - Desbanear*
🕷️➤ ${usedPrefix}listban *- Lista Negra ⚰️*
🕷️➤ ${usedPrefix}detect *on/off - Detección*
🕷️➤ ${usedPrefix}ruletaban *<@tag> - Ruleta Mortal*
🕷️➤ ${usedPrefix}link *- Link del grupo*

༺═──────────────═༻
⛧ 𝕯𝖊𝖘𝖈𝖆𝖗𝖌𝖆𝖘 🔥
༺═──────────────═༻
🕷️➤ ${usedPrefix}tiktok *<url>*
🕷️➤ ${usedPrefix}play *<nombre>*
🕷️➤ ${usedPrefix}ytmp4 *<nombre>*
🕷️➤ ${usedPrefix}pindl *<url>*
🕷️➤ ${usedPrefix}instagram *<url>*
🕷️➤ ${usedPrefix}facebook *<url>*
🕷️➤ ${usedPrefix}spotify *<canción>*

༺═──────────────═༻
⛧ 𝕱𝖚𝖓 / 𝕵𝖚𝖊𝖌𝖔𝖘 🎭
༺═──────────────═༻
🕷️➤ ${usedPrefix}kiss *- Beso random*
🕷️➤ ${usedPrefix}top *<texto> - Ranking*
🕷️➤ ${usedPrefix}gay *- Detector gay 🌈*
🕷️➤ ${usedPrefix}pajeame *- Acción random*
🕷️➤ ${usedPrefix}doxeo *<@user> - Fake doxeo*
🕷️➤ ${usedPrefix}doxiing *<@user> - Fake info*
🕷️➤ ${usedPrefix}formarpareja *- Pareja random*
🕷️➤ ${usedPrefix}formarpareja5 *- Pareja x5*
🕷️➤ ${usedPrefix}sortear *- Sorteo*
🕷️➤ ${usedPrefix}sorpresa *- Random sorpresa*
🕷️➤ ${usedPrefix}pareja *- Proponer pareja*
🕷️➤ ${usedPrefix}aceptar *- Aceptar pareja*
🕷️➤ ${usedPrefix}rechazar *- Rechazar pareja*
🕷️➤ ${usedPrefix}terminar *- Terminar relación*
🕷️➤ ${usedPrefix}mipareja *- Ver pareja*
🕷️➤ ${usedPrefix}listparejas *- Lista de parejas*
🕷️➤ ${usedPrefix}ex *- Ex parejas*
🕷️➤ ${usedPrefix}juegos *- Menú de juegos*

༺═──────────────═༻
⛧ 𝕳𝖊𝖗𝖗𝖆𝖒𝖎𝖊𝖓𝖙𝖆𝖘 🔧
༺═──────────────═༻
🕷️➤ ${usedPrefix}s *<img> - Sticker*
🕷️➤ ${usedPrefix}brat *<txt> - Brat sticker*
🕷️➤ ${usedPrefix}rvocal *<audio> - Cambiar voz*
🕷️➤ ${usedPrefix}tourl2 *<img> - A URL*
🕷️➤ ${usedPrefix}hd *<img> - Mejorar foto*
🕷️➤ ${usedPrefix}tourl *<img> - A enlace*
🕷️➤ ${usedPrefix}reportar *<txt> - Invocar admins*
🕷️➤ ${usedPrefix}perfil *- Perfil grupo*
🕷️➤ ${usedPrefix}grupos *- Ver grupos*
🕷️➤ ${usedPrefix}owner *- Info del dueño*
🕷️➤ ${usedPrefix}ping *- Velocidad*

༺═──────────────═༻
⛧ 𝕴𝖆 & 𝕬𝖗𝖙𝖊 👁️
༺═──────────────═༻
🕷️➤ ${usedPrefix}magicstudio *<txt> - Generar arte*
🕷️➤ ${usedPrefix}bot *<txt> - Chat IA*
🕷️➤ ${usedPrefix}editfoto *<desc> - Editar foto*
🕷️➤ ${usedPrefix}wpw *- Wallpapers*
🕷️➤ ${usedPrefix}gemini *<txt> - Gemini AI*
🕷️➤ ${usedPrefix}bgremover *<img> - Quitar fondo*
🕷️➤ ${usedPrefix}pinterest *<txt> - Pinterest*
🕷️➤ ${usedPrefix}ssweb *<txt> - Screenshot web*

༺═──────────────═༻
⛧ 𝕺𝖜𝖓𝖊𝖗 🔱
༺═──────────────═༻
🕷️➤ ${usedPrefix}reiniciar *- Reinicia bot*
🕷️➤ ${usedPrefix}setname *<nombre> - Cambiar nombre*
🕷️➤ ${usedPrefix}setpp *<img> - Cambiar foto perfil*
🕷️➤ ${usedPrefix}restart *- Restart bot*
🕷️➤ ${usedPrefix}update *- Actualizar*
🕷️➤ ${usedPrefix}ping *- Velocidad*

╔═━━━✦•☠•✦━━━═╗
    F I N   D E L   M E N Ú
╚═━━━✦•☠•✦━━━═╝
`.trim()

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
