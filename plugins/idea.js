let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`✍️ Escribe tu ${command === 'idea' ? 'idea' : 'sugerencia'}.\nEjemplo:\n.${command} que el bot tenga más juegos.`)
  }

  try {
    // ID del grupo oficial - CAMBIA ESTE ID POR EL CORRECTO
    const grupoOficial = '120363185955473607@g.us'

    // Solo obtener información básica sin verificar el grupo
    let nombreGrupo = 'Chat privado'
    if (m.isGroup) {
      try {
        let infoGrupo = await conn.groupMetadata(m.chat)
        nombreGrupo = infoGrupo?.subject || 'Grupo sin nombre'
      } catch (e) {
        nombreGrupo = 'Grupo desconocido'
      }
    }
    
    // Obtener nombre del usuario
    const nombreUsuario = await conn.getName(m.sender) || 'Usuario'
    const numeroUsuario = m.sender.split('@')[0]

    // Mensaje que se enviará al grupo oficial
    let mensaje = `🧠 *Nueva ${command === 'idea' ? 'Idea' : 'Sugerencia'} Recibida*

👤 *Usuario:* ${nombreUsuario}
📱 *Número:* wa.me/${numeroUsuario}
📍 *Desde:* ${nombreGrupo}

💬 *Mensaje:*
"${text}"

⏰ *Fecha:* ${new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires' })}`

    // Intentar enviar directamente sin verificaciones previas
    await conn.sendMessage(grupoOficial, { 
      text: mensaje,
      mentions: [m.sender] // Mencionar al usuario que envió la idea
    })

    // Confirmación al usuario
    await m.reply(`✅ ¡Gracias ${nombreUsuario}! Tu ${command === 'idea' ? 'idea' : 'sugerencia'} fue enviada correctamente.`)
    
  } catch (error) {
    console.error('Error completo:', error)
    console.error('Detalles del error:', {
      message: error.message,
      code: error.code,
      status: error.status,
      grupoID: '120363185955473607@g.us'
    })
    
    // Mensaje de error más específico
    await m.reply(`❌ Error: No se pudo enviar tu ${command === 'idea' ? 'idea' : 'sugerencia'}.
    
🔧 *Posibles soluciones:*
• Verifica que el bot esté en el grupo oficial
• Confirma que el ID del grupo sea correcto
• Asegúrate que el bot tenga permisos

📧 Contacta al administrador del bot.`)
  }
}
    console.error('Error enviando idea/sugerencia:', error)
    await m.reply(`❌ Ocurrió un error al enviar tu ${command === 'idea' ? 'idea' : 'sugerencia'}. Inténtalo más tarde.`)
  }
}

handler.help = ['idea', 'sugerencia']
handler.tags = ['info']
handler.command = /^(idea|sugerencia)$/i

export default handler
