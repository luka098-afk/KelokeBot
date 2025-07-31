var handler = async (m, { conn, text, usedPrefix, command }) => {
    let targetUser, number, bot, bant, ownerNumber, aa, users, usr

    try {
        function no(number) {
            return number.replace(/\s/g, '').replace(/([@+-])/g, '')
        }
        
        const nn = conn.getName(m.sender)
        bot = conn.user.jid.split`@`[0]
        bant = `❀ Por favor, etiqueta o escribe el número del usuario al que quieres banear del Bot.`
        
        // Determinar el usuario objetivo con formato JID correcto
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            // Usuario mencionado
            targetUser = m.mentionedJid[0]
        } else if (m.quoted && m.quoted.sender) {
            // Usuario del mensaje citado
            targetUser = m.quoted.sender
        } else if (text) {
            // Número escrito manualmente
            text = no(text)
            number = isNaN(text) ? text.split`@`[1] : text
            targetUser = number + '@s.whatsapp.net'
        } else {
            return conn.reply(m.chat, bant, m)
        }

        // Asegurar formato JID correcto
        const userJid = targetUser.includes('@') ? targetUser : `${targetUser}@s.whatsapp.net`
        number = userJid.split('@')[0]

        // Verificar si es el bot
        if (userJid === conn.user.jid) {
            return conn.reply(m.chat, `✧ @${bot} No puede ser baneado con este comando.`, m, { mentions: [userJid] })
        }

        // Verificar si es owner
        for (let i = 0; i < global.owner.length; i++) {
            ownerNumber = global.owner[i][0]
            if (userJid.replace(/@s\.whatsapp\.net$/, '') === ownerNumber) {
                aa = ownerNumber + '@s.whatsapp.net'
                await conn.reply(m.chat, `✧ No puedo banear al propietario @${ownerNumber} del bot.`, m, { mentions: [aa] })
                return
            }
        }

        // Verificar y actualizar estado de ban
        users = global.db.data.users
        if (!users[userJid]) {
            users[userJid] = { banned: false }
        }
        if (users[userJid].banned === true) {
            return conn.reply(m.chat, `✦ No es necesario volver a banear a @${number}.`, m, { mentions: [userJid] })
        }

        // Banear usuario
        users[userJid].banned = true
        usr = m.sender.split('@')[0]
        await conn.reply(m.chat, `❀ Usuario @${number} baneado con éxito.`, m, { mentions: [userJid] })
        
        // Notificar al usuario baneado (si suittag está definido)
        let nametag = conn.getName(userJid)
        if (typeof suittag !== 'undefined') {
            await conn.reply(`${suittag}@s.whatsapp.net`, `❀ El usuario *${nametag}* ha sido Baneado por *${nn}*.`, m)
        }
        
    } catch (e) {
        console.error('Error en banuser:', e)
        await conn.reply(m.chat, `⚠︎ Ocurrió un error: ${e.message}`, m)
    }
}

handler.help = ['banuser <@tag> <razón>']
handler.command = ['banuser']
handler.tags = ['mods']
handler.rowner = true

export default handler
