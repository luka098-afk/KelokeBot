const handler = async (m, { conn, args, text, usedPrefix, command }) => {
    let user
    let db = global.db.data.users

    // Emojis definidos (puedes cambiarlos a gusto)
    const emoji = '🟢'
    const done = '✅'
    const suittag = '59896026646' // Reemplaza con tu número sin el + si querés notificación
    const emoji4 = '⚠️'

    if (m.quoted) {
        user = m.quoted.sender
    } else if (args.length >= 1) {
        user = args[0].replace('@', '') + '@s.whatsapp.net'
    } else {
        await conn.reply(m.chat, `${emoji} Por favor, etiqueta o coloca el número del usuario que quieres desbanear del Bot.`, m)
        return
    }

    if (db[user]) {
        db[user].banned = false
        db[user].banRazon = ''
        const nametag = await conn.getName(user)
        const nn = await conn.getName(m.sender)
        await conn.reply(m.chat, `${done} El usuario *${nametag}* ha sido desbaneado.`, m, { mentionedJid: [user] })
        await conn.reply(`${suittag}@s.whatsapp.net`, `${emoji} El usuario *${nametag}* ha sido desbaneado por *${nn}*.`, m)
    } else {
        await conn.reply(m.chat, `${emoji4} El usuario no está registrado.`, m)
    }
}

handler.help = ['unbanuser <@tag>']
handler.command = ['unbanuser']
handler.tags = ['mods']
handler.rowner = true

export default handler
