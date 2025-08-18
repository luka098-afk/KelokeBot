import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text }) => {
  try {
    // Detectar contexto
    const isGroup = m.isGroup || m.chat.endsWith('@g.us')

    // Normalizar JID del sender
    let sender = m.sender
    let senderRaw = sender.split('@')[0]

    let target, targetRaw

    // 1️⃣ Usar mensaje citado si existe
    if (m.quoted && m.quoted.sender) {
      target = m.quoted.sender
      targetRaw = target.split('@')[0]

    // 2️⃣ Usar menciones directas
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      target = m.mentionedJid[0]
      targetRaw = target.split('@')[0]

    // 3️⃣ Extraer del texto manualmente
    } else if (text) {
      const matches = text.match(/@(\d{5,15})/g)
      if (!matches) return m.reply('⚠️ Formato inválido. Menciona a la persona o cita su mensaje.')
      targetRaw = matches[0].replace('@', '')
      const senderDomain = sender.split('@')[1] || 's.whatsapp.net'
      target = `${targetRaw}@${senderDomain}`

    } else {
      return m.reply('⚠️ Debes mencionar o citar a la persona a la que quieres declarar tu amor.')
    }

    if (target === sender) return m.reply('❌ No puedes declararte a ti mismo.')

    const senderName = conn.getName(sender) || senderRaw
    const targetName = conn.getName(target) || targetRaw

    // Leer solicitudes existentes
    const solicitudesPath = path.join('./database', 'solicitudes.json')
    let solicitudes = {}
    try {
      solicitudes = JSON.parse(fs.readFileSync(solicitudesPath))
    } catch {
      solicitudes = {}
    }

    // Verificar solicitud existente
    const claveTarget = target
    const existingSolicitud = solicitudes[claveTarget]?.find(s =>
      s.jid === sender || s.numero === senderRaw
    )

    if (existingSolicitud) {
      return m.reply(`❌ Ya enviaste una solicitud a @${targetRaw}.`, null, { mentions: [target] })
    }

    // Guardar solicitud
    if (!solicitudes[claveTarget]) solicitudes[claveTarget] = []
    const nuevaSolicitud = {
      jid: sender,
      targetJid: target,
      nombre: senderName,
      targetNombre: targetName,
      numero: senderRaw,
      targetNumero: targetRaw,
      isGroup: isGroup,
      chatContext: m.chat,
      fecha: new Date().toISOString()
    }
    solicitudes[claveTarget].push(nuevaSolicitud)

    // Crear directorio si no existe
    const dbDir = path.dirname(solicitudesPath)
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
    fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2))

    // Preparar mensaje
    const mensaje = `💖 ¡Declaración de amor! 💖

@${senderRaw} se ha declarado a @${targetRaw}

💕 ¡Qué momento tan especial! 💕

@${targetRaw} para aceptar la declaración escribe:
*.aceptar*@${senderRaw}

Para rechazar la declaración escribe:
*.rechazar* @${senderRaw}

¡Que el amor florezca! 🌹`

    // Enviar mensaje con menciones
    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [sender, target]
    })

  } catch (error) {
    console.error('❌ Error en .pareja:', error)
    m.reply('❌ Ocurrió un error al enviar tu declaración. Verifica el formato e inténtalo de nuevo.')
  }
}

handler.help = ['pareja @número']
handler.tags = ['pareja']
handler.command = /^pareja$/i

export default handler
