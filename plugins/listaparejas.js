import fs from 'fs'

const handler = async (m, { conn }) => {
  const file = './database/parejas.json'
  let parejas = {}
  if (fs.existsSync(file)) {
    parejas = JSON.parse(fs.readFileSync(file))
  }

  const entries = Object.entries(parejas).filter(([_, v]) => v.estado === 'aceptada')
  if (entries.length === 0) return m.reply('⚠️ No hay parejas registradas actualmente.')

  let texto = '📋 Parejas registradas:\n\n'
  let mentions = []

  for (const [key, data] of entries) {
    // Mostrar solo número limpio + espacio
    const userNum = key.split('@')[0]
    const parejaNum = data.pareja.split('@')[0]

    // Dar formato: + prefijo para números Uruguay (por ejemplo) o según región (ajustar si quieres)
    // Aquí simplificamos: + prefijo solo si empieza con 598 (Uruguay)
    const formatNumber = (num) => {
      if (num.startsWith('598') && num.length === 11) {
        return '+598 ' + num.slice(3, 5) + ' ' + num.slice(5, 8) + ' ' + num.slice(8)
      }
      return '+' + num
    }

    texto += `💑 @${userNum} ❤️ @${parejaNum}\n`
    mentions.push(key, data.pareja)
  }

  await conn.reply(m.chat, texto, m, { mentions })
}

handler.help = ['listaparejas']
handler.tags = ['fun']
handler.command = /^listaparejas$/i

export default handler
