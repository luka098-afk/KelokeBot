import { welcome } from '../lib/database.js'

let handler = async (m, { conn, args, isAdmin, usedPrefix, command }) => {

// Verificar que sea administrador
if (!isAdmin) return m.reply(`🎃 *Solo los administradores pueden usar este comando.*`)

let isEnable = /true|enable|(turn)?on|1/i.test(command)
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
let bot = global.db.data.settings[conn.user.jid] || {}

if (args[0] === 'on' || args[0] === 'enable' || args[0] === '1') {
    if (chat.welcome) return m.reply(`🎃 *El welcome ya está activado en este grupo.*`)
    chat.welcome = true
    m.reply(`╭━〔 🎃 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗔𝗰𝘁𝗶𝘃𝗮𝗱𝗼! 👻 〕━⬣
┃
┃ 🦇 ¡Welcome activado correctamente!
┃ 🕷️ Ahora daré la bienvenida a 
┃    nuevos miembros y despediré
┃    a los que se van.
┃
╰━━━━━━━━━━━━━━━━━━⬣`)

} else if (args[0] === 'off' || args[0] === 'disable' || args[0] === '0') {
    if (!chat.welcome) return m.reply(`🎃 *El welcome ya está desactivado en este grupo.*`)
    chat.welcome = false
    m.reply(`╭━〔 🎃 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝗗𝗲𝘀𝗮𝗰𝘁𝗶𝘃𝗮𝗱𝗼 👻 〕━⬣
┃
┃ 💀 Welcome desactivado correctamente.
┃ 🕸️ Ya no daré mensajes de
┃    bienvenida ni despedida.
┃
╰━━━━━━━━━━━━━━━━━━⬣`)

} else {
    m.reply(`╭━〔 🎃 𝗖𝗼𝗺𝗮𝗻𝗱𝗼 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 👻 〕━⬣
┃
┃ 🦇 *Uso:* ${usedPrefix + command} on/off
┃ 🕷️ *Ejemplo:* ${usedPrefix + command} on
┃ 
┃ 📋 *Estado actual:* ${chat.welcome ? '✅ Activado' : '❌ Desactivado'}
┃
╰━━━━━━━━━━━━━━━━━━⬣`)
}

}

handler.help = ['welcome'].map(v => v + ' <on/off>')
handler.tags = ['group']
handler.command = ['welcome', 'bienvenida']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
