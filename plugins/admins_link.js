let handler = async (m, { conn, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!isBotAdmin) return m.reply('⛔ El bot necesita ser administrador para obtener el enlace.')

  try {
    let link = await conn.groupInviteCode(m.chat)
    m.reply(`🔗 *Link del grupo:*\nhttps://chat.whatsapp.com/${link}`)
  } catch (e) {
    console.error(e)
    m.reply('⚠️ No pude obtener el enlace del grupo.')
  }
}

handler.command = /^link$/i
handler.group = true
handler.botAdmin = true

export default handler
