let handler = async (m, { participants, usedPrefix, command, conn }) => {
  let sender = '@' + m.sender.split('@')[0]
  let mentionedJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0])
  
  if (!mentionedJid) {
    m.reply(`💋 ${sender} se dio un beso a sí mismo 😳`)
  } else {
    let target = '@' + mentionedJid.split('@')[0]
    if (mentionedJid === m.sender) {
      m.reply(`💋 ${sender} se dio un beso a sí mismo 😳`)
    } else {
      m.reply(`💋 ${sender} le dio un beso a ${target} 😘`, null, {
        mentions: [m.sender, mentionedJid]
      })
    }
  }
}

handler.command = ['kiss']
handler.help = ['kiss @usuario']
handler.tags = ['fun']

export default handler
