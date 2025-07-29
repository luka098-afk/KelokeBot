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

// 💀 Filtro que detecta Temu, sin errores
export async function before(m, { conn, isBotAdmin }) {
  if (!m.isGroup || !isBotAdmin || m.fromMe || !m.text) return

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antitemu) return

  const temuRegex = /https?:\/\/(www\.)?(share\.)?temu\.com\/\S+/i
  if (!temuRegex.test(m.text)) return

  try {
    // Borra el mensaje original con link
    await conn.sendMessage(m.chat, { delete: m.key })

    // Responde al usuario con mención
    await conn.reply(
      m.chat,
      `@${m.sender.split('@')[0]} no mandes links de Temu.\nNo seas gil ni te la creas.`,
      m,
      { mentions: [m.sender] }
    )
  } catch (e) {
    console.error('[❌ ANTITEMU ERROR]', e)
  }
}
