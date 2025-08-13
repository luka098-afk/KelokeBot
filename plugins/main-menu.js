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

【𝕷 𝖎 𝖘 𝖙 𝖆 - 𝕯𝖊 - 𝕮 𝖔 𝖒 𝖆 𝖓 𝖉 𝖔 𝖘】
┝🕷️ 🕷️${usedPrefix}idea <texto> - 𝗘͓̽𝗻͓̽𝘃͓̽í͓̽𝗮͓̽ 𝘁͓̽𝘂͓̽ 𝗶͓̽𝗱͓̽𝗲͓̽𝗮͓̽ 𝗮͓̽ 𝗹͓̽𝗼͓̽𝘀͓̽ 𝗢͓̽𝘄͓̽𝗻͓̽𝗲͓̽𝗿͓̽𝘀͓̽ ☠️🧠

◈───≼ ⚰️ ADMINS ⚰️ ≽──⊚
🕷️┝⎆ [ 🕷️${usedPrefix}warn <@tag> - 𝗔͓̽𝗱͓̽𝘃͓̽𝗲͓̽𝗿͓̽𝘁͓̽𝗶͓̽𝗿͓̽ 𝗮͓̽ 𝗮͓̽𝗹͓̽𝗴͓̽𝘂͓̽𝗶͓̽𝗲͓̽𝗻͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}unwarn <@tag> - 𝗦͓̽𝗮͓̽𝗰͓̽𝗮͓̽𝗿͓̽𝗹͓̽𝗲͓̽ 𝗹͓̽𝗮͓̽ 𝗮͓̽𝗱͓̽𝘃͓̽𝗲͓̽𝗿͓̽𝘁͓̽𝗲͓̽𝗻͓̽𝗰͓̽𝗶͓̽𝗮͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}listadv - 𝗩͓̽𝗲͓̽𝗿͓̽ 𝗮͓̽𝗱͓̽𝘃͓̽𝗲͓̽𝗿͓̽𝘁͓̽𝗲͓̽𝗻͓̽𝗰͓̽𝗶͓̽𝗮͓̽𝘀͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}mute - 𝘀͓̽𝗶͓̽𝗹͓̽𝗲͓̽𝗻͓̽𝗰͓̽𝗶͓̽𝗮͓̽𝗿͓̽ 𝗮͓̽ 𝗮͓̽𝗹͓̽𝗴͓̽𝘂͓̽𝗶͓̽𝗲͓̽𝗻͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}unmute - 𝘀͓̽𝗮͓̽𝗰͓̽𝗮͓̽𝗿͓̽𝗹͓̽𝗲͓̽ 𝗲͓̽𝗹͓̽ 𝘀͓̽𝗶͓̽𝗹͓̽𝗲͓̽𝗻͓̽𝗰͓̽𝗶͓̽𝗮͓̽𝗿͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}ht <texto> - 𝗠͓̽𝗲͓̽𝗻͓̽𝗰͓̽𝗶͓̽ó͓̽𝗻͓̽ 𝗺͓̽𝗮͓̽𝘀͓̽𝗶͓̽𝘃͓̽𝗮͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}g - 𝗔͓̽𝗯͓̽𝗿͓̽𝗶͓̽𝗿͓̽/𝗖͓̽𝗲͓̽𝗿͓̽𝗿͓̽𝗮͓̽𝗿͓̽ 𝗴͓̽𝗿͓̽𝘂͓̽𝗽͓̽𝗼͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}tagall - 𝗠͓̽𝗲͓̽𝗻͓̽𝗰͓̽𝗶͓̽𝗼͓̽𝗻͓̽𝗮͓̽𝗿͓̽ 𝗮͓̽ 𝘁͓̽𝗼͓̽𝗱͓̽𝗼͓̽𝘀͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}setppgrupo <img> - 𝗖͓̽𝗮͓̽𝗺͓̽𝗯͓̽𝗶͓̽𝗮͓̽𝗿͓̽ 𝗳͓̽𝗼͓̽𝘁͓̽𝗼͓̽ 𝗴͓̽𝗿͓̽𝘂͓̽𝗽͓̽𝗼͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}k <@tag> - 𝗘͓̽𝘅͓̽𝗽͓̽𝘂͓̽𝗹͓̽𝘀͓̽𝗮͓̽𝗿͓̽ 𝗺͓̽𝗶͓̽𝗲͓̽𝗺͓̽𝗯͓̽𝗿͓̽𝗼͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}del - 𝗘͓̽𝗹͓̽𝗶͓̽𝗺͓̽𝗶͓̽𝗻͓̽𝗮͓̽𝗿͓̽ 𝗺͓̽𝗲͓̽𝗻͓̽𝘀͓̽𝗮͓̽𝗷͓̽𝗲͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}p <@tag> - 𝗗͓̽𝗮͓̽𝗿͓̽ 𝗮͓̽𝗱͓̽𝗺͓̽𝗶͓̽𝗻͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}d <@tag> - 𝗤͓̽𝘂͓̽𝗶͓̽𝘁͓̽𝗮͓̽𝗿͓̽ 𝗮͓̽𝗱͓̽𝗺͓̽𝗶͓̽𝗻͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}autoadmin - 𝗘͓̽𝗹͓̽ 𝗯͓̽𝗼͓̽𝘁͓̽ 𝘁͓̽𝗲͓̽ 𝗱͓̽𝗮͓̽ 𝗮͓̽𝗱͓̽𝗺͓̽𝗶͓̽𝗻͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}banuser @tag - 𝗕͓̽𝗮͓̽𝗻͓̽𝗲͓̽𝗮͓̽ 𝗮͓̽𝗹͓̽ 𝗲͓̽𝘁͓̽𝗶͓̽𝗾͓̽𝘂͓̽𝗲͓̽𝘁͓̽𝗮͓̽𝗱͓̽𝗼͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}unbanuser @tag - 𝗗͓̽𝗲͓̽𝘀͓̽𝗯͓̽𝗮͓̽𝗻͓̽𝗲͓̽𝗮͓̽ 𝗮͓̽𝗹͓̽ 𝗲͓̽𝘁͓̽𝗶͓̽𝗾͓̽𝘂͓̽𝗲͓̽𝘁͓̽𝗮͓̽𝗱͓̽𝗼͓̽
┝⎆ [ 🕷️${usedPrefix}listban - ⚰️ 𝗟͓̽𝗶͓̽𝘀͓̽𝘁͓̽𝗮͓̽ 𝗡͓̽𝗲͓̽𝗴͓̽𝗿͓̽𝗮͓̽ 𝗱͓̽𝗲͓̽ 𝗹͓̽𝗼͓̽𝘀͓̽ 𝗖͓̽𝗼͓̽𝗻͓̽𝗱͓̽𝗲͓̽𝗻͓̽𝗮͓̽𝗱͓̽𝗼͓̽𝘀͓̽💀
👁️‍🗨️┝⎆ [ 🕷️${usedPrefix}detect on/off - 𝗗͓̽𝗲͓̽𝘁͓̽𝗲͓̽𝗰͓̽𝘁͓̽𝗮͓̽ 𝗮͓̽𝗰͓̽𝗰͓̽𝗶͓̽𝗼͓̽𝗻͓̽𝗲͓̽𝘀͓̽ 𝗵͓̽𝗲͓̽𝗰͓̽𝗵͓̽𝗮͓̽𝘀͓̽ 𝗽͓̽𝗼͓̽𝗿͓̽ 𝗮͓̽𝗱͓̽𝗺͓̽𝗶͓̽𝗻͓̽𝘀͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}ruletaban @tag ] - 𝕽͓̽𝖚͓̽𝖑͓̽𝖊͓̽𝖙͓̽𝖆͓̽ 𝕬͓̽𝖑͓̽𝖊͓̽𝖆͓̽𝖙͓̽𝖔͓̽𝖗͓̽𝖎͓̽𝖆͓̽ ☠️
🕷️┝⎆ [ 🕷️${usedPrefix}link - 𝗢͓̽𝗯͓̽𝘁͓̽𝗶͓̽𝗲͓̽𝗻͓̽𝗲͓̽ 𝗲͓̽𝗹͓̽ 𝗹͓̽𝗶͓̽𝗻͓̽𝗸͓̽ 𝗱͓̽𝗲͓̽𝗹͓̽ 𝗴͓̽𝗿͓̽𝘂͓̽𝗽͓̽𝗼͓̽
◈┄──━━┉─࿂

◈───≼ 🧟‍♀️ DESCARGAS 🧟‍♀️ ≽──⊚
🕷️┝⎆ [ 🕷️${usedPrefix}tiktok <link> - 𝗗͓̽𝗲͓̽𝘀͓̽𝗰͓̽𝗮͓̽𝗿͓̽𝗴͓̽𝗮͓̽𝗿͓̽ 𝘃͓̽𝗶͓̽𝗱͓̽𝗲͓̽𝗼͓̽ 𝗧͓̽𝗧͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}play <nombre> - 𝗗͓̽𝗲͓̽𝘀͓̽𝗰͓̽𝗮͓̽𝗿͓̽𝗴͓̽𝗮͓̽𝗿͓̽ 𝗰͓̽𝗮͓̽𝗻͓̽𝗰͓̽𝗶͓̽ó͓̽𝗻͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}play2 <nombre> - 𝗗͓̽𝗲͓̽𝘀͓̽𝗰͓̽𝗮͓̽𝗿͓̽𝗴͓̽𝗮͓̽𝗿͓̽ 𝘃͓̽𝗶͓̽𝗱͓̽𝗲͓̽𝗼͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}pindl <link> - 𝗗͓̽𝗲͓̽𝘀͓̽𝗰͓̽𝗮͓̽𝗿͓̽𝗴͓̽𝗮͓̽𝗿͓̽ 𝗶͓̽𝗺͓̽𝗮͓̽𝗴͓̽𝗲͓̽𝗻͓̽ 𝗣͓̽𝗶͓̽𝗻͓̽𝘁͓̽𝗲͓̽𝗿͓̽𝗲͓̽𝘀͓̽𝘁͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}instagram <link> - 𝗗͓̽𝗲͓̽𝘀͓̽𝗰͓̽𝗮͓̽𝗿͓̽𝗴͓̽𝗮͓̽𝗿͓̽ 𝗱͓̽𝗲͓̽ 𝗜͓̽𝗚͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}facebook <link> - 𝗗͓̽𝗲͓̽𝘀͓̽𝗰͓̽𝗮͓̽𝗿͓̽𝗴͓̽𝗮͓̽𝗿͓̽ 𝘃͓̽𝗶͓̽𝗱͓̽𝗲͓̽𝗼͓̽ 𝗙͓̽𝗕͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}spotify <canción> - 𝗗͓̽𝗲͓̽𝘀͓̽𝗰͓̽𝗮͓̽𝗿͓̽𝗴͓̽𝗮͓̽𝗿͓̽ 𝗲͓̽𝗻͓̽ 𝗦͓̽𝗽͓̽𝗼͓̽𝘁͓̽𝗶͓̽𝗳͓̽𝘆͓̽
◈┄──━━┉─࿂

◈───≼ 🧟 FUN 🧟 ≽──⊚
🕷️┝⎆ [ 🕷️${usedPrefix}kiss - 𝗘͓̽𝗻͓̽𝘃͓̽𝗶͓̽𝗮͓̽𝗿͓̽ 𝗯͓̽𝗲͓̽𝘀͓̽𝗼͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}top <texto> - 𝗥͓̽𝗮͓̽𝗻͓̽𝗸͓̽𝗶͓̽𝗻͓̽𝗴͓̽ 𝗱͓̽𝗶͓̽𝘃͓̽𝗲͓̽𝗿͓̽𝘁͓̽𝗶͓̽𝗱͓̽𝗼͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}gay - 𝗣͓̽𝗼͓̽𝗿͓̽𝗰͓̽𝗲͓̽𝗻͓̽𝘁͓̽𝗮͓̽𝗷͓̽𝗲͓̽ 𝗴͓̽𝗮͓̽𝘆͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}pajeame - 𝗝͓̽𝗼͓̽𝗱͓̽𝗮͓̽ 𝘀͓̽𝗲͓̽𝘅͓̽𝘂͓̽𝗮͓̽𝗹͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}doxeo @usuario - 𝗜͓̽𝗻͓̽𝗳͓̽𝗼͓̽ 𝗳͓̽𝗮͓̽𝗹͓̽𝘀͓̽𝗮͓̽ 𝗱͓̽𝗶͓̽𝘃͓̽𝗲͓̽𝗿͓̽𝘁͓̽𝗶͓̽𝗱͓̽𝗮͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}doxing @usuario - 𝗗͓̽𝗼͓̽𝘅͓̽𝗲͓̽𝗼͓̽ 𝗿͓̽𝗮͓̽𝗻͓̽𝗱͓̽𝗼͓̽𝗺͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}formarpareja - 𝗖͓̽𝗿͓̽𝗲͓̽𝗮͓̽ 𝘂͓̽𝗻͓̽𝗮͓̽ 𝗽͓̽𝗮͓̽𝗿͓̽𝗲͓̽𝗷͓̽𝗮͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}formarpareja5 - 𝗖͓̽𝗿͓̽𝗲͓̽𝗮͓̽ 𝗽͓̽𝗮͓̽𝗿͓̽𝗲͓̽𝗷͓̽𝗮͓̽ 𝟱͓̽.𝟬͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}sortear - 𝗦͓̽𝗼͓̽𝗿͓̽𝘁͓̽𝗲͓̽𝗼͓̽ 𝗮͓̽𝗹͓̽ 𝗮͓̽𝘇͓̽𝗮͓̽𝗿͓̽ 𝗲͓̽𝗻͓̽𝘁͓̽𝗿͓̽𝗲͓̽ 𝗺͓̽𝗼͓̽𝗿͓̽𝘁͓̽𝗮͓̽𝗹͓̽𝗲͓̽𝘀͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}sorpresa - ¿𝗾͓̽𝘂͓̽𝗶͓̽𝗲͓̽𝗿͓̽𝗲͓̽𝘀͓̽ 𝘀͓̽𝗮͓̽𝗯͓̽𝗲͓̽𝗿͓̽ 𝗲͓̽𝗹͓̽ 𝘀͓̽𝗲͓̽𝗰͓̽𝗿͓̽𝗲͓̽𝘁͓̽𝗼͓̽?☠️
🕷️┝⎆ [ 🕷️${usedPrefix}pareja - 𝗠͓̽á͓̽𝗻͓̽𝗱͓̽𝗮͓̽𝗹͓̽𝗲͓̽ 𝗽͓̽𝗮͓̽𝗿͓̽𝗲͓̽𝗷͓̽𝗮͓̽ 𝗮͓̽ 𝗮͓̽𝗹͓̽𝗴͓̽𝘂͓̽𝗶͓̽𝗲͓̽𝗻͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}aceptar - 𝗔͓̽𝗰͓̽𝗲͓̽𝗽͓̽𝘁͓̽𝗮͓̽𝗹͓̽𝗲͓̽ 𝗮͓̽ 𝘁͓̽𝘂͓̽ 𝗳͓̽𝘂͓̽𝘁͓̽𝘂͓̽𝗿͓̽𝗮͓̽ 𝗽͓̽𝗮͓̽𝗿͓̽𝗲͓̽𝗷͓̽𝗮͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}rechazar - 𝗥͓̽𝗲͓̽𝗰͓̽𝗵͓̽𝗮͓̽𝘇͓̽𝗮͓̽ 𝗹͓̽𝗮͓̽ 𝘀͓̽𝗼͓̽𝗹͓̽𝗶͓̽𝗰͓̽𝗶͓̽𝘁͓̽𝘂͓̽𝗱͓̽ 𝗱͓̽𝗲͓̽ 𝗽͓̽𝗮͓̽𝗿͓̽𝗲͓̽𝗷͓̽𝗮͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}terminar - 𝗧͓̽𝗲͓̽𝗿͓̽𝗺͓̽𝗶͓̽𝗻͓̽𝗮͓̽𝗹͓̽𝗲͓̽ 𝗮͓̽ 𝘁͓̽𝘂͓̽ 𝗽͓̽𝗮͓̽𝗿͓̽𝗲͓̽𝗷͓̽𝗮͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}mipareja - 𝗩͓̽𝗲͓̽𝗿͓̽ 𝘁͓̽𝘂͓̽ 𝗽͓̽𝗮͓̽𝗿͓̽𝗲͓̽𝗷͓̽𝗮͓̽ 𝗮͓̽𝗰͓̽𝘁͓̽𝘂͓̽𝗮͓̽𝗹͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}listparejas - 𝗩͓̽𝗲͓̽𝗿͓̽ 𝗹͓̽𝗶͓̽𝘀͓̽𝘁͓̽𝗮͓̽ 𝗱͓̽𝗲͓̽ 𝗽͓̽𝗮͓̽𝗿͓̽𝗲͓̽𝗷͓̽𝗮͓̽𝘀͓̽ 𝗮͓̽𝗰͓̽𝘁͓̽𝘂͓̽𝗮͓̽𝗹͓̽𝗲͓̽𝘀͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}ex - 𝗩͓̽𝗲͓̽𝗿͓̽ 𝘁͓̽𝗼͓̽𝗱͓̽𝗼͓̽𝘀͓̽ 𝗹͓̽𝗼͓̽𝘀͓̽ 𝗲͓̽𝘅͓̽ 𝗾͓̽𝘂͓̽𝗲͓̽ 𝘁͓̽𝘂͓̽𝘃͓̽𝗶͓̽𝘀͓̽𝘁͓̽𝗲͓̽
🕷️ [ 🕷️${usedPrefix}juegos - 𝗝͓̽𝘂͓̽𝗲͓̽𝗴͓̽𝗼͓̽𝘀͓̽ 𝗱͓̽𝗶͓̽𝘀͓̽𝗽͓̽𝗼͓̽𝗻͓̽𝗶͓̽𝗯͓̽𝗹͓̽𝗲͓̽𝘀͓̽
◈┄──━━┉─࿂

◈───≼🕷️HERRAMIENTAS🕸≽──⊚
🕷️┝⎆ [ 🕷️${usedPrefix}s <img> - 𝗖͓̽𝗿͓̽𝗲͓̽𝗮͓̽𝗿͓̽ 𝘀͓̽𝘁͓̽𝗶͓̽𝗰͓̽𝗸͓̽𝗲͓̽𝗿͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}brat <texto> - 𝗦͓̽𝘁͓̽𝗶͓̽𝗰͓̽𝗸͓̽𝗲͓̽𝗿͓̽ 𝗯͓̽𝗿͓̽𝗮͓̽𝘁͓̽ 𝘀͓̽𝘁͓̽𝘆͓̽𝗹͓̽𝗲͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}rvocal <audio> - 𝗖͓̽𝗮͓̽𝗺͓̽𝗯͓̽𝗶͓̽𝗮͓̽𝗿͓̽ 𝘃͓̽𝗼͓̽𝘇͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}tourl2 <img> - 𝗖͓̽𝗼͓̽𝗻͓̽𝘃͓̽𝗲͓̽𝗿͓̽𝘁͓̽𝗶͓̽𝗿͓̽ 𝗲͓̽𝗻͓̽ 𝗨͓̽𝗥͓̽𝗟͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}hd <imagen> - 𝗠͓̽𝗲͓̽𝗷͓̽𝗼͓̽𝗿͓̽𝗮͓̽𝗿͓̽ 𝗰͓̽𝗮͓̽𝗹͓̽𝗶͓̽𝗱͓̽𝗮͓̽𝗱͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}tourl <imagen> - 𝗜͓̽𝗺͓̽𝗮͓̽𝗴͓̽𝗲͓̽𝗻͓̽ 𝗮͓̽ 𝗲͓̽𝗻͓̽𝗹͓̽𝗮͓̽𝗰͓̽𝗲͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}reportar <texto> - 🕷️ 𝗜͓̽𝗻͓̽𝘃͓̽𝗼͓̽𝗰͓̽𝗮͓̽ 𝗮͓̽ 𝗹͓̽𝗼͓̽𝘀͓̽ 𝔄͓̽𝔡͓̽𝔪͓̽𝔦͓̽𝔫͓̽𝔰͓̽ 𝗱͓̽𝗲͓̽𝗹͓̽ 𝗺͓̽á͓̽𝘀͓̽ 𝗮͓̽𝗹͓̽𝗹͓̽á͓̽ 🩸
🕷️┝⎆ [ 🕷️${usedPrefix}perfil - 𝗩͓̽𝗲͓̽𝗿͓̽ 𝗽͓̽𝗲͓̽𝗿͓̽𝗳͓̽𝗶͓̽𝗹͓̽ 𝗴͓̽𝗿͓̽𝘂͓̽𝗽͓̽𝗼͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}grupos - 𝗟͓̽𝗶͓̽𝘀͓̽𝘁͓̽𝗮͓̽ 𝗱͓̽𝗲͓̽ 𝗴͓̽𝗿͓̽𝘂͓̽𝗽͓̽𝗼͓̽𝘀͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}owner - 𝗜͓̽𝗻͓̽𝗳͓̽𝗼͓̽ 𝗱͓̽𝗲͓̽𝗹͓̽ 𝗼͓̽𝘄͓̽𝗻͓̽𝗲͓̽𝗿͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}ping - 𝗩͓̽𝗲͓̽𝗹͓̽𝗼͓̽𝗰͓̽𝗶͓̽𝗱͓̽𝗮͓̽𝗱͓̽ 𝗱͓̽𝗲͓̽𝗹͓̽ 𝗯͓̽𝗼͓̽𝘁͓̽
◈┄──━━┉─࿂

◈───≼ 🧟‍♂️ IA & ARTE 🧟‍♂️ ≽──⊚
🕷️┝⎆ [ 🕷️${usedPrefix}magicstudio <texto> - 𝗚͓̽𝗲͓̽𝗻͓̽𝗲͓̽𝗿͓̽𝗮͓̽𝗿͓̽ 𝗶͓̽𝗺͓̽𝗮͓̽𝗴͓̽𝗲͓̽𝗻͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}bot <texto> - 𝗖͓̽𝗵͓̽𝗮͓̽𝘁͓̽ 𝗜͓̽𝗔͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}editfoto <desc> - 𝗘͓̽𝗱͓̽𝗶͓̽𝘁͓̽𝗮͓̽𝗿͓̽ 𝗳͓̽𝗼͓̽𝘁͓̽𝗼͓̽ 𝗜͓̽𝗔͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}wpw - 𝗪͓̽𝗮͓̽𝗹͓̽𝗹͓̽𝗽͓̽𝗮͓̽𝗽͓̽𝗲͓̽𝗿͓̽ 𝗿͓̽𝗮͓̽𝗻͓̽𝗱͓̽𝗼͓̽𝗺͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}gemini <texto> - 𝗚͓̽𝗲͓̽𝗺͓̽𝗶͓̽𝗻͓̽𝗶͓̽ 𝗜͓̽𝗔͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}bgremover <img> - 𝗤͓̽𝘂͓̽𝗶͓̽𝘁͓̽𝗮͓̽𝗿͓̽ 𝗳͓̽𝗼͓̽𝗻͓̽𝗱͓̽𝗼͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}pinterest <texto> - 𝗕͓̽𝘂͓̽𝘀͓̽𝗰͓̽𝗮͓̽𝗿͓̽ 𝗶͓̽𝗺͓̽á͓̽𝗴͓̽𝗲͓̽𝗻͓̽𝗲͓̽𝘀͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}ssweb <texto> - 𝗕͓̽𝘂͓̽𝘀͓̽𝗰͓̽𝗮͓̽𝗿͓̽ 𝗽͓̽á͓̽𝗴͓̽𝗶͓̽𝗻͓̽𝗮͓̽𝘀͓̽
◈┄──━━┉─࿂

◈───≼ 🧟‍♂️ OWNER 🧟‍♂️ ≽──⊚
🕷️┝⎆ [ 🕷️${usedPrefix}reiniciar - 𝗥͓̽𝗲͓̽𝗶͓̽𝗻͓̽𝗶͓̽𝗰͓̽𝗶͓̽𝗮͓̽𝗿͓̽ 𝗯͓̽𝗼͓̽𝘁͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}setname <nombre> - 𝗖͓̽𝗮͓̽𝗺͓̽𝗯͓̽𝗶͓̽𝗮͓̽𝗿͓̽ 𝗻͓̽𝗼͓̽𝗺͓̽𝗯͓̽𝗿͓̽𝗲͓̽ 𝗯͓̽𝗼͓̽𝘁͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}setpp <img> - 𝗖͓̽𝗮͓̽𝗺͓̽𝗯͓̽𝗶͓̽𝗮͓̽𝗿͓̽ 𝗳͓̽𝗼͓̽𝘁͓̽𝗼͓̽ 𝗯͓̽𝗼͓̽𝘁͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}restart - 𝗥͓̽𝗲͓̽𝗶͓̽𝗻͓̽𝗶͓̽𝗰͓̽𝗶͓̽𝗼͓̽ 𝗺͓̽𝗮͓̽𝗻͓̽𝘂͓̽𝗮͓̽𝗹͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}update - 𝗔͓̽𝗰͓̽𝘁͓̽𝘂͓̽𝗮͓̽𝗹͓̽𝗶͓̽𝘇͓̽𝗮͓̽𝗿͓̽ 𝗯͓̽𝗼͓̽𝘁͓̽
🕷️┝⎆ [ 🕷️${usedPrefix}ping - 𝗩͓̽𝗲͓̽𝗹͓̽𝗼͓̽𝗰͓̽𝗶͓̽𝗱͓̽𝗮͓̽𝗱͓̽ 𝗱͓̽𝗲͓̽𝗹͓̽ 𝗯͓̽𝗼͓̽𝘁͓̽
◈┄──━━┉─࿂
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
