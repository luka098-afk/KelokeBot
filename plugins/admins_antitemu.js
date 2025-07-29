let temuRegex = /(?:https?:\/\/)?(?:www\.)?(temu\.com|temu\.to)\/\S+/i

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner }) {
  if (!m.isGroup) return
  if (!isBotAdmin) return
  if (isAdmin || isOwner) return

  let chat = global.db.data.chats[m.chat] || {}
  if (!chat.antitemu) return

  if (temuRegex.test(m.text)) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key }) // Elimina solo el mensaje
      await conn.sendMessage(m.chat, { text: '🚫 No creas en bobadas, los enlaces de Temu están prohibidos.' })
    } catch (e) {
      console.error('❌ Error en AntiTemu:', e)
    }
  }
}

let handler = async (m, { conn, command, isAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')
  if (!isAdmin) return m.reply('⛔ Solo los administradores pueden usar este comando.')

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}

  const activar = !/off/i.test(command)
  global.db.data.chats[m.chat].antitemu = activar

  m.reply(`✅ AntiTemu ${activar ? 'activado' : 'desactivado'} correctamente.`)
}

handler.command = /^antitemu(off)?$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
