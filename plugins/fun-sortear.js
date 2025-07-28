import util from 'util'
import path from 'path'

async function handler(m, { groupMetadata, conn, text, usedPrefix }) {
  const user = jid => '@' + jid.split('@')[0]

  if (!text) return conn.reply(m.chat, `🕷️ Por favor escribe lo que deseas sortear.\n\nEjemplo:\n${usedPrefix}sortear una skin, un rol, etc.`, m)

  let participantes = groupMetadata.participants.map(v => v.id)
  let ganador = participantes[Math.floor(Math.random() * participantes.length)]

  let audioIndex = Math.floor(Math.random() * 70)
  let audioUrl = `https://hansxd.nasihosting.com/sound/sound${audioIndex}.mp3`

  let mensaje = `🎉 *¡SORTEO AL AZAR!* 🎉\n\n📦 Premio: *${text}*\n🥳 Ganador: ${user(ganador)}\n\n¡Felicitaciones! 🎊`

  // Animación de escritura
  let txt = ''
  let count = 0
  for (const c of mensaje) {
    await new Promise(resolve => setTimeout(resolve, 15))
    txt += c
    count++
    if (count % 10 === 0) {
      conn.sendPresenceUpdate('composing', m.chat)
    }
  }

  await conn.sendMessage(m.chat, {
    text: txt.trim(),
    mentions: [ganador]
  }, {
    quoted: m,
    ephemeralExpiration: 24 * 60 * 1000,
    disappearingMessagesInChat: 24 * 60 * 1000
  })

  await conn.sendFile(m.chat, audioUrl, 'sorteo.mp3', null, m)
}

handler.help = ['sortear']
handler.command = ['sortear']
handler.tags = ['fun']
handler.group = true
handler.register = true

export default handler
