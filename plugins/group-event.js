let handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return
    let chat = global.db.data.chats[m.chat]
    
    // Verificar que welcome esté activado
    if (!chat.welcome) return
    
    // Verificar que el bot sea admin para poder enviar mensajes
    if (!isBotAdmin) return
    
    let pp, ppgc
    let { action, participants: participantsAction } = m.messageStubParameters || m
    
    // Obtener foto de perfil del grupo
    try {
        ppgc = await conn.profilePictureUrl(m.chat, 'image')
    } catch {
        ppgc = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png'
    }

    // Procesar cada participante
    for (let participant of participantsAction || []) {
        
        // Obtener foto de perfil del usuario
        try {
            pp = await conn.profilePictureUrl(participant, 'image')
        } catch {
            pp = 'https://i.ibb.co/2WzLyGk/profile.jpg'
        }
        
        // Obtener información del grupo
        let groupMetadata = await conn.groupMetadata(m.chat)
        let groupName = groupMetadata.subject
        let memberCount = groupMetadata.participants.length

        // MENSAJE DE BIENVENIDA
        if (action === 'add') {
            let welcomeText = `╭━〔 🎃 𝗕𝗶𝗲𝗻𝘃𝗲𝗻𝗶𝗱𝗼/𝗮! 👻 〕━⬣
┃
┃ 🦇 ¡Hola @${participant.split('@')[0]}!
┃ 🕷️ Te damos la bienvenida a:
┃ 📱 *${groupName}*
┃
┃ 👥 Miembros: *${memberCount}*
┃ 🎭 ¡Disfruta tu estadía!
┃
╰━━━━━━━━━━━━━━━━━━⬣

🎃 *¡Que comience la diversión!* 🎃`

            await conn.sendMessage(m.chat, {
                text: welcomeText,
                contextInfo: {
                    mentionedJid: [participant],
                    externalAdReply: {
                        title: '🎃 ¡Nuevo Miembro!',
                        body: `Bienvenido/a a ${groupName}`,
                        thumbnailUrl: pp,
                        sourceUrl: '',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            })
        }
        
        // MENSAJE DE DESPEDIDA
        else if (action === 'remove') {
            let goodbyeText = `╭━〔 🎃 𝗔𝗱𝗶ó𝘀! 👻 〕━⬣
┃
┃ 💀 Salió @${participant.split('@')[0]}
┃ 🕸️ De: *${groupName}*
┃
┃ 👥 Miembros restantes: *${memberCount}*
┃ 🦇 ¡Hasta la vista!
┃
╰━━━━━━━━━━━━━━━━━━⬣

👻 *Se fue como fantasma...* 💨`

            await conn.sendMessage(m.chat, {
                text: goodbyeText,
                contextInfo: {
                    mentionedJid: [participant],
                    externalAdReply: {
                        title: '👻 Miembro se fue',
                        body: `Salió de ${groupName}`,
                        thumbnailUrl: pp,
                        sourceUrl: '',
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            })
        }
    }
}

export default handler
