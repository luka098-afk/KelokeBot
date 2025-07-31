let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`✍️ Escribe tu ${command === 'idea' ? 'idea' : 'sugerencia'}.\nEjemplo:\n.${command} que el bot tenga más juegos.`)
  }

  try {
    const grupoOficial = '120363415757582798@g.us'
    
    // Verificar si el bot está en el grupo oficial
    let chats = Object.values(conn.chats || {})
    let estaEnGrupo = chats.some(c => c.id === grupoOficial)
    if (!estaEnGrupo) throw new Error('El bot no está en el grupo oficial')

    // Obtener nombre del grupo actual
    let nombreGrupo = 'Chat privado'
    if (m.isGroup) {
      try {
        let infoGrupo = await conn.groupMetadata(m.chat)
        nombreGrupo = infoGrupo?.subject || 'Grupo sin nombre'
      } catch {
        nombreGrupo = 'Grupo desconocido'
      }
    }

    const nombreUsuario = await conn.getName(m.sender) || 'Usuario'
    const numeroUsuario = m.sender.split('@')[0]

    let mensaje = `🧠 *Nueva ${command === 'idea' ? 'Idea' : 'Sugerencia'} Recibida*

👤 *Usuario:* ${nombreUsuario}
📱 *Número:* wa.me/${numeroUsuario}
📍 *Desde:* ${nombreGrupo}

💬 *Mensaje:*
"${text}"

⏰ *Fecha:* ${new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires' })}`

    await conn.sendMessage(grupoOficial, { 
      text: mensaje,
      mentions: [m.sender]
    })

    await m.reply(`✅ ¡Gracias ${nombreUsuario}! Tu ${command === 'idea' ? 'idea' : 'sugerencia'} fue enviada correctamente.`)
    
  } catch (error) {
    console.error('Error enviando idea/sugerencia:', error)
    await m.reply(`❌ No se pudo enviar tu ${command === 'idea' ? 'idea' : 'sugerencia'}.
    
🔧 *Posibles causas:*
• El bot no está en el grupo oficial
• No tiene permisos
• Ocurrió un error interno (${error?.message})`)
  }
}

handler.help = ['idea', 'sugerencia']
handler.tags = ['info']
handler.command = /^(idea|sugerencia)$/i

export default handler
