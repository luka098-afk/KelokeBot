import fs from 'fs'

const handler = async (m, { conn }) => {
  const exparejasFile = './database/exparejas.json'
  let exparejas = {}

  if (fs.existsSync(exparejasFile)) {
    exparejas = JSON.parse(fs.readFileSync(exparejasFile))
  }

  // Reemplazamos el ID de WhatsApp por formato @lid
  const senderNum = m.sender.replace(/@.+/, '')
  const senderId = `@${senderNum}`

  // Buscar ex parejas del usuario
  const exs = Object.entries(exparejas)
    .filter(([key, val]) => key === senderId)
    .map(([key, val]) => val.ex)

  if (exs.length === 0) {
    return m.reply('🤷‍♂️ No tienes ex parejas registradas.')
  }

  let texto = `📋 Tus ex parejas:\n\n`
  for (const exId of exs) {
    const exNum = exId.replace(/^@/, '')
    texto += `💔 @${exNum}\n`
  }

  // Convertimos los @lid a formato de mención válido para WhatsApp
  const mentions = exs.map(id => id.replace(/^@/, '') + '@s.whatsapp.net')

  await conn.reply(m.chat, texto, m, { mentions })
}

handler.help = ['ex']
handler.tags = ['fun']
handler.command = /^ex$/i

export default handler
