let handler = async function (m, { conn, groupMetadata }) {
  // Si hay menciones, mostrar ID del usuario mencionado
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    const userJid = m.mentionedJid[0]
    const userName = await conn.getName(userJid) || 'Usuario'
    const number = userJid.split('@')[0]
    
    const mensaje = `
╭─✿ *ID de Usuario* ✿─╮
│  *Nombre:* ${userName}
│  *Número:* ${number}
│  *JID/ID:* ${userJid}
╰─────────────────────╯`.trim()
    
    return conn.reply(m.chat, mensaje, m, { mentions: [userJid] })
  }

  // Si no hay menciones y es un grupo, mostrar ID del grupo
  if (m.isGroup) {
    const mensaje = `
╭─✿ *ID del Grupo* ✿─╮
│  *Nombre:* ${groupMetadata.subject}
│  *JID/ID:* ${m.chat}
│  *Participantes:* ${groupMetadata.participants.length}
╰─────────────────────╯`.trim()
    
    return conn.reply(m.chat, mensaje, m)
  }

  // Si no es grupo y no hay menciones, mostrar ayuda
  const ayuda = `
📋 *Uso del comando ID/LID:*

🏷️ *.id @usuario* - Ver ID de usuario
🏢 *.id* (en grupo) - Ver ID del grupo
📱 *.lid* - Ver lista completa de participantes

💡 *Ejemplos:*
• .id @juan
• .id (en un grupo)
• .lid (lista completa)`.trim()
  
  return conn.reply(m.chat, ayuda, m)
}

// Handler para lista completa de participantes
let handlerLid = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  const participantes = groupMetadata?.participants || []

  const tarjetas = participantes.map((p, index) => {
    const jid = p.id || 'N/A'
    const username = '@' + jid.split('@')[0]
    const estado = p.admin === 'superadmin' ? '👑 *Propietario*' :
                   p.admin === 'admin' ? '🛡️ *Administrador*' :
                   '👤 *Miembro*'

    return [
      '╭─✿ *Usuario ' + (index + 1) + '* ✿',
      `│  *Nombre:* ${username}`,
      `│  *JID:* ${jid}`,
      `│  *Rol:* ${estado}`,
      '╰───────────────✿'
    ].join('\n')
  })

  const contenido = tarjetas.join('\n\n')
  const mencionados = participantes.map(p => p.id).filter(Boolean)

  const mensajeFinal = `╭━━━❖『 *Lista de Participantes* 』❖━━━╮
👥 *Grupo:* ${groupMetadata.subject}
🔢 *Total:* ${participantes.length} miembros
╰━━━━━━━━━━━━━━━━━━━━━━╯

${contenido}`

  return conn.reply(m.chat, mensajeFinal, m, { mentions: mencionados })
}

// Configuración para .id
handler.command = ['id']
handler.help = ['id', 'id @user']
handler.tags = ['info']

// Configuración para .lid 
handlerLid.command = ['lid']
handlerLid.help = ['lid']
handlerLid.tags = ['group']
handlerLid.group = true

// Exportar ambos handlers
export { handler as default, handlerLid }
