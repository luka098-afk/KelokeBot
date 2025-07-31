let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`✍️ Escribe tu ${command === 'idea' ? 'idea' : 'sugerencia'}.\nEjemplo:\n.${command} que el bot tenga más juegos.`)
  }

  try {
    // ID del grupo oficial (bot ya está dentro)
    const grupoOficial = '120363185955473607@g.us'

    // Verificar si el bot está en el grupo antes de enviar
    let grupoExiste = false
    try {
      await conn.groupMetadata(grupoOficial)
      grupoExiste = true
    } catch (e) {
      console.log('El grupo oficial no existe o el bot no está en él')
    }

    if (!grupoExiste) {
      return m.reply(`❌ Error: No se pudo enviar tu ${command === 'idea' ? 'idea' : 'sugerencia'}. El grupo oficial no está disponible.`)
    }

    // Obtener el nombre del grupo desde donde se envió
    let infoGrupo = m.isGroup ? await conn.groupMetadata(m.chat) : null
    let nombreGrupo = infoGrupo?.subject || 'Chat privado'
    
    // Obtener nombre del usuario
    const nombreUsuario = await conn.getName(m.sender) || 'Usuario'
    const numeroUsuario = m.sender.split('@')[0]

    // Mensaje que se enviará al grupo oficial
    let mensaje = `
🧠 *Nueva ${command === 'idea' ? 'idea' : 'sugerencia'} recibida*

📤 *De:* ${nombreUsuario} (wa.me/${numeroUsuario})
👥 *Grupo:* ${nombreGrupo}
📌 *Mensaje:*
${text}
`.trim()

    // Enviar al grupo oficial con manejo de errores
    await conn.sendMessage(grupoOficial, { text: mensaje })

    // Confirmación al usuario
    await m.reply(`✅ ¡Gracias! Tu ${command === 'idea' ? 'idea' : 'sugerencia'} fue enviada al grupo oficial del bot.`)
    
  } catch (error) {
    console.error('Error enviando idea/sugerencia:', error)
    await m.reply(`❌ Ocurrió un error al enviar tu ${command === 'idea' ? 'idea' : 'sugerencia'}. Inténtalo más tarde.`)
  }
}

handler.help = ['idea', 'sugerencia']
handler.tags = ['info']
handler.command = /^(idea|sugerencia)$/i

export default handler
