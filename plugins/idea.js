// Objeto para almacenar los cooldowns de usuarios
let userCooldowns = {}

let handler = async (m, { conn, text, command }) => {
  const userId = m.sender
  const ahora = Date.now()
  const cooldownTime = 24 * 60 * 60 * 1000 // 24 horas en milisegundos

  if (!text) {
    return m.reply(`✍️ Escribe tu ${command === 'idea' ? 'idea' : 'sugerencia'}.\n\n⚠️ *Importante:* Cada usuario puede enviar solo una ${command === 'idea' ? 'idea' : 'sugerencia'} cada 24 horas.\n\n💭 *Piensa muy bien tu mensaje antes de enviarlo.*\n\nEjemplo:\n.${command} que el bot tenga más juegos.`)
  }

  // Verificar cooldown
  if (userCooldowns[userId] && (ahora - userCooldowns[userId]) < cooldownTime) {
    const tiempoRestante = cooldownTime - (ahora - userCooldowns[userId])
    const horasRestantes = Math.floor(tiempoRestante / (1000 * 60 * 60))
    const minutosRestantes = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60))
    
    return m.reply(`⏰ *Ya enviaste una ${command === 'idea' ? 'idea' : 'sugerencia'} recientemente.*\n\n🕐 *Tiempo restante:* ${horasRestantes}h ${minutosRestantes}m\n\n💡 *Recuerda:* Solo puedes enviar una ${command === 'idea' ? 'idea' : 'sugerencia'} cada 24 horas.`)
  }

  try {
    const grupoOficial = '120363415757582798@g.us'

    let chats = Object.values(conn.chats || {})
    let estaEnGrupo = chats.some(c => c.id === grupoOficial)
    if (!estaEnGrupo) throw new Error('El bot no está en el grupo oficial')

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

👤 *Usuario:* @${numeroUsuario}
📍 *Desde:* ${nombreGrupo}

💬 *Mensaje:*
"${text}"

⏰ *Fecha:* ${new Date().toLocaleString('es-ES', { timeZone: 'America/Argentina/Buenos_Aires' })}`

    await conn.sendMessage(grupoOficial, {
      text: mensaje,
      mentions: [m.sender]
    })

    // Registrar el cooldown del usuario
    userCooldowns[userId] = ahora

    await m.reply(`✅ ¡Gracias ${nombreUsuario}! Tu ${command === 'idea' ? 'idea' : 'sugerencia'} fue enviada correctamente.\n\n⏰ *Recuerda:* Podrás enviar otra ${command === 'idea' ? 'idea' : 'sugerencia'} en 24 horas.`)

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
