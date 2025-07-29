let handler = async (m, { conn, args, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  if (args[0] === 'on') {
    chat.antitemu = true
    m.reply('🛡️ Antitemu activado en este grupo.')
  } else if (args[0] === 'off') {
    chat.antitemu = false
    m.reply('❌ Antitemu desactivado en este grupo.')
  } else {
    m.reply(`📛 Usa:\n🩸┝⎆ [ ${usedPrefix}${command} on\n🩸┝⎆ [ ${usedPrefix}${command} off`)
  }
}

handler.command = /^antitemu$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

// 💀 Filtro que detecta Temu mejorado
export async function before(m, { conn, isBotAdmin, isAdmin }) {
  // Verificaciones básicas más completas
  if (!m.isGroup || !isBotAdmin || m.fromMe) return
  if (!m.text && !m.caption) return // También revisar captions de imágenes/videos

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antitemu) return

  // Texto a analizar (mensaje o caption)
  const textToCheck = m.text || m.caption || ''
  
  // Regex más completa para detectar enlaces de Temu
  const temuRegex = /(?:https?:\/\/)?(?:www\.)?(?:share\.)?temu\.com\/[\w\-._~:/?#[\]@!$&'()*+,;=]*/gi
  
  // También detectar menciones de temu sin links
  const temuMentionRegex = /\btemu\b/gi
  
  const hasTemuLink = temuRegex.test(textToCheck)
  const hasTemuMention = temuMentionRegex.test(textToCheck)
  
  if (!hasTemuLink && !hasTemuMention) return

  try {
    console.log(`[ANTITEMU] Detectado en ${m.chat}: ${textToCheck}`)
    
    // Borra el mensaje original
    await conn.sendMessage(m.chat, { delete: m.key })
    
    // Espera un poco antes de responder para evitar rate limits
    await new Promise(resolve => setTimeout(resolve, 500))

    // Respuesta personalizada según el tipo de detección
    let responseText = ''
    if (hasTemuLink) {
      responseText = `@${m.sender.split('@')[0]} no mandes links de Temu.\nNo seas gil ni te la creas.`
    } else {
      responseText = `@${m.sender.split('@')[0]} no promociones Temu en este grupo.`
    }

    await conn.reply(
      m.chat,
      responseText,
      m,
      { mentions: [m.sender] }
    )
    
    console.log(`[ANTITEMU] Mensaje eliminado y usuario advertido: ${m.sender}`)
    
  } catch (e) {
    console.error('[❌ ANTITEMU ERROR]', e)
    // Intento alternativo si falla el primer método
    try {
      await conn.chatModify({ delete: true, lastMessage: m }, m.chat)
    } catch (e2) {
      console.error('[❌ ANTITEMU ERROR BACKUP]', e2)
    }
  }
}
