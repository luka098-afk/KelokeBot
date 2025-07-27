import fs from 'fs'

const handler = async (m, { conn }) => {
  if (!m.messageStubType) return

  const isJoin =
    m.messageStubType === 27 || // agregado por admin
    m.messageStubType === 28    // se unió por enlace

  if (!isJoin) return

  const participants = m.messageStubParameters || []
  if (!participants.length) return

  let data = []
  try {
    data = JSON.parse(fs.readFileSync('./database/listanegra.json'))
  } catch {
    data = []
  }

  for (let user of participants) {
    const block = data.find(u => u.jid === user)
    if (block) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        await conn.sendMessage(m.chat, {
          text: `⛔ @${user.split('@')[0]} fue eliminado por estar en la lista negra.\n📝 Razón: *${block.razon}*`,
          mentions: [user]
        })
      } catch (e) {
        console.error('Error al expulsar:', e)
      }
    }
  }
}

handler.before = handler.group = handler.participant = true
export default handler
