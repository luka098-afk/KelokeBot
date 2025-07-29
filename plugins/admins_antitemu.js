let handler = async (m, { conn, args, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  if (args[0] === 'on') {
    global.db.data.chats[m.chat].antitemu = true
    m.reply('🛡️ Antitemu activado en este grupo.')
  } else if (args[0] === 'off') {
    global.db.data.chats[m.chat].antitemu = false
    m.reply('❌ Antitemu desactivado en este grupo.')
  } else {
    m.reply(`📛 Usa correctamente:\n🩸┝⎆ [ ${usedPrefix}${command} on\n🩸┝⎆ [ ${usedPrefix}${command} off`)
  }
}

handler.command = /^antitemu$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

// Filtro automático incluido en el mismo archivo
export async function before(m, { conn }) {
  if (!m.isGroup) return
  let chat = global.db.data.chats[m.chat]
  if (!chat?.antitemu) return

  const temuRegex = /https?:\/\/(www\.)?(share\.)?temu\.com\/\S+/i
  if (temuRegex.test(m.text)) {
    try {
      // Eliminar mensaje
      await conn.sendMessage(m.chat, { delete: m.key })

      // Responder al usuario que lo mandó
      await conn.reply(
        m.chat,
        `@${m.sender.split('@')[0]} no mandes links de Temu.\nNo seas gil ni te la creas.`,
        m,
        { mentions: [m.sender] }
      )
    } catch (e) {
      console.error('❌ Error en filtro Temu:', e)
    }
  }
}
