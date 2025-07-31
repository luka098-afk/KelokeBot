const handler = async (m, { conn, args, text, usedPrefix, command }) => {
    let targetUser
    let db = global.db.data.users

    // Emojis definidos
    const emoji = '🟢'
    const done = '✅'
    const suittag = '59896026646' // Reemplaza con tu número sin el + si querés notificación

    // Determinar el usuario objetivo con formato JID correcto
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        // Usuario mencionado
        targetUser = m.mentionedJid[0]
    } else if (m.quoted && m.quoted.sender) {
        // Usuario del mensaje citado
        targetUser = m.quoted.sender
    } else if (args.length >= 1) {
        // Número escrito manualmente
        const number = args[0].replace('@', '').replace(/\s/g, '').replace(/([@+-])/g, '')
        targetUser = number + '@s.whatsapp.net'
    } else {
        await conn.reply(m.chat, `${emoji} Por favor, etiqueta o coloca el número del usuario que quieres desbanear del Bot.`, m)
        return
    }

    // Asegurar formato JID correcto
    const userJid = targetUser.includes('@') ? targetUser : `${targetUser}@s.whatsapp.net`

    // Crear entrada en la base de datos si no existe
    if (!db[userJid]) {
        db[userJid] = { banned: false, banRazon: '' }
    }

    // Desbanear usuario
    db[userJid].banned = false
    db[userJid].banRazon = ''
    
    const nametag = await conn.getName(userJid)
    const nn = await conn.getName(m.sender)
    
    await conn.reply(m.chat, `${done} El usuario *${nametag}* ha sido desbaneado.`, m, { mentions: [userJid] })
    await conn.reply(`${suittag}@s.whatsapp.net`, `${emoji} El usuario *${nametag}* ha sido desbaneado por *${nn}*.`, m)
}

handler.help = ['unbanuser <@tag>']
handler.command = ['unbanuser']
handler.tags = ['mods']
handler.rowner = true

export default handler
