import fs from 'fs'

const handler = async (m, { conn }) => {
  try {
    const exparejasFile = './database/exparejas.json'
    let exparejas = {}

    if (fs.existsSync(exparejasFile)) {
      exparejas = JSON.parse(fs.readFileSync(exparejasFile))
    }

    // Usar la lógica mejorada para obtener el sender
    const senderRaw = m.sender.split('@')[0]
    const senderClean = m.sender.includes('@') ? m.sender : `${m.sender}@s.whatsapp.net`
    const senderId = `@${senderRaw}`

    // Buscar ex parejas del usuario
    const exs = Object.entries(exparejas)
      .filter(([key, val]) => key === senderId)
      .map(([key, val]) => val.ex)

    if (exs.length === 0) {
      return m.reply('🤷‍♂️ No tienes ex parejas registradas.')
    }

    let texto = `📋 Tus ex parejas:\n\n`
    const mentionsArray = []

    for (const exId of exs) {
      const exRaw = exId.replace(/^@/, '')
      texto += `💔 @${exRaw}\n`
      
      // Limpiar y normalizar cada JID de ex pareja
      const exClean = `${exRaw}@s.whatsapp.net`
      mentionsArray.push(exClean)
    }

    // Usar sendMessage con mentions array limpio
    await conn.sendMessage(m.chat, {
      text: texto,
      mentions: mentionsArray
    })

  } catch (error) {
    console.error('Error en .ex:', error)
    m.reply('❌ Ocurrió un error al consultar tus ex parejas.')
  }
}

handler.help = ['ex']
handler.tags = ['fun']
handler.command = /^ex$/i

export default handler
