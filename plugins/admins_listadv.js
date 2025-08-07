const handler = async (m, { conn, groupMetadata, isAdmin }) => {
  if (!m.isGroup) return m.reply('✦ Este comando solo se puede usar en grupos.')
  if (!isAdmin) return m.reply('✦ Solo los administradores pueden usar este comando.')

  // Verificar si existe el sistema de advertencias
  if (!global.db.data.chats[m.chat].warns) {
    return m.reply('📋 *No hay usuarios con advertencias en este grupo.*')
  }

  const warns = global.db.data.chats[m.chat].warns
  const warnedUsers = Object.keys(warns)

  if (warnedUsers.length === 0) {
    return m.reply('📋 *No hay usuarios con advertencias en este grupo.*')
  }

  const groupName = groupMetadata.subject
  let listaTexto = `📋 *LISTA DE ADVERTENCIAS* 📋\n\n🔰 *Grupo:* ${groupName}\n\n`

  const mentionedUsers = []
  let contador = 1

  for (const userJid of warnedUsers) {
    const warnData = warns[userJid]

    if (!warnData || typeof warnData !== 'object') continue

    const count = warnData.count || 0
    if (count <= 0) continue

    const userName = await conn.getName(userJid)
    const lastDate = warnData.date || 'Sin fecha'

    listaTexto += `${contador}. @${userJid.split('@')[0]}\n`
    listaTexto += `   ⚠️ *Advertencias:* ${count}/3\n`
    listaTexto += `   📅 *Última fecha:* ${lastDate}\n\n`

    mentionedUsers.push(userJid)
    contador++
  }

  listaTexto += `📊 *Total de usuarios advertidos:* ${mentionedUsers.length}\n`

  try {
    await conn.sendMessage(m.chat, {
      text: listaTexto,
      mentions: mentionedUsers
    }, { quoted: m })
  } catch (e) {
    console.error(e)
    await m.reply('❌ Error al mostrar la lista de advertencias.')
  }
}

handler.command = ['listadv', 'listaadvertencias', 'listwarns', 'advertencias']
handler.tags = ['grupo']
handler.group = true
handler.admin = true

export default handler
