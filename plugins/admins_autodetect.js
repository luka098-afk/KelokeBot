let WAMessageStubType = (await import('@whiskeysockets/baileys')).default

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return
  if (!m.sender) return // Verificar que m.sender esté definido

  // Canal oficial (lo mismo que en los otros plugins)
  const channelRD = global.channelRD || { id: '120363386229166956@newsletter', name: 'Canal Oficial' }
  const ctxInfo = (mentions = []) => ({
    mentionedJid: mentions,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelRD.id,
      serverMessageId: 100,
      newsletterName: channelRD.name
    }
  })

  const fkontak = { 
    "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, 
    "message": { 
      "contactMessage": { 
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
      }
    }, 
    "participant": "0@s.whatsapp.net"
  }

  let chat = global.db.data.chats[m.chat]
  let usuario = `@${m.sender.split`@`[0]}`
  let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg'

  let nombre, foto, edit, newlink, status, admingp, noadmingp
  nombre = `*✨️ ${usuario} Ha cambiado el nombre del grupo.*\n\n> ✧ Ahora el grupo se llama:\n> *${m.messageStubParameters && m.messageStubParameters[0] ? m.messageStubParameters[0] : 'Nombre no disponible'}*.`
  foto = `✨️ Se ha cambiado la imagen del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`
  edit = `✨️ ${usuario} Ha permitido que ${m.messageStubParameters && m.messageStubParameters[0] ? (m.messageStubParameters[0] == 'on' ? 'solo admins' : 'todos') : 'desconocido'} puedan configurar el grupo.`
  newlink = `✨️ El enlace del grupo ha sido restablecido.\n\n> ✧ Acción hecha por:\n> » ${usuario}`
  status = `✨️ El grupo ha sido ${m.messageStubParameters && m.messageStubParameters[0] ? (m.messageStubParameters[0] == 'on' ? '*cerrado*' : '*abierto*') : 'modificado'} Por ${usuario}\n\n> ✧ Ahora ${m.messageStubParameters && m.messageStubParameters[0] ? (m.messageStubParameters[0] == 'on' ? '*solo admins*' : '*todos*') : 'estado desconocido'} pueden enviar mensaje.`
  admingp = `✨️ ${m.messageStubParameters && m.messageStubParameters[0] ? `@${m.messageStubParameters[0].split`@`[0]}` : 'Alguien'} Ahora es admin del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`
  noadmingp =  `✨️ ${m.messageStubParameters && m.messageStubParameters[0] ? `@${m.messageStubParameters[0].split`@`[0]}` : 'Alguien'} Deja de ser admin del grupo.\n\n> ✧ Acción hecha por:\n> » ${usuario}`

  if (chat.detect && m.messageStubType == 21) {
    await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender], contextInfo: ctxInfo([m.sender]) }, { quoted: fkontak })

  } else if (chat.detect && m.messageStubType == 22) {
    await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender], contextInfo: ctxInfo([m.sender]) }, { quoted: fkontak })

  } else if (chat.detect && m.messageStubType == 23) {
    await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender], contextInfo: ctxInfo([m.sender]) }, { quoted: fkontak })

  } else if (chat.detect && m.messageStubType == 25) {
    await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender], contextInfo: ctxInfo([m.sender]) }, { quoted: fkontak })

  } else if (chat.detect && m.messageStubType == 26) {
    await conn.sendMessage(m.chat, { text: status, mentions: [m.sender], contextInfo: ctxInfo([m.sender]) }, { quoted: fkontak })

  } else if (chat.detect && m.messageStubType == 29) {
    if (m.messageStubParameters && m.messageStubParameters[0]) {
      await conn.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`], contextInfo: ctxInfo([m.sender, m.messageStubParameters[0]]) }, { quoted: fkontak })
    } else {
      await conn.sendMessage(m.chat, { text: `✨️ alguien ha sido promovido a admin.\n\n> ✧ Acción hecha por:\n> » ${usuario}`, mentions: [m.sender], contextInfo: ctxInfo([m.sender]) }, { quoted: fkontak })
    }

  } else if (chat.detect && m.messageStubType == 30) {
    if (m.messageStubParameters && m.messageStubParameters[0]) {
      await conn.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`], contextInfo: ctxInfo([m.sender, m.messageStubParameters[0]]) }, { quoted: fkontak })
    } else {
      await conn.sendMessage(m.chat, { text: `✨️ Alguien ha dejado de ser admin.\n\n> ✧ Acción hecha por:\n> » ${usuario}`, mentions: [m.sender], contextInfo: ctxInfo([m.sender]) }, { quoted: fkontak })
    }

  } else {
    if (m.messageStubType == 2) return
    console.log({
      messageStubType: m.messageStubType,
      messageStubParameters: m.messageStubParameters,
      type: WAMessageStubType[m.messageStubType],
    })
  }
}

export default handler
