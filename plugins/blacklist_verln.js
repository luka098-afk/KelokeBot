import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  const dbPath = './database/listanegra.json'
  let listaNegra = []

  try {
    listaNegra = JSON.parse(fs.readFileSync(dbPath))
  } catch {
    return m.reply('⚠️ La lista negra está vacía o no existe.')
  }

  if (!Array.isArray(listaNegra) || listaNegra.length === 0)
    return m.reply('⚠️ La lista negra está vacía.')

  let text = '📛 *Lista Negra:*\n\n'
  let mentions = []
  listaNegra.forEach((item, i) => {
    if (!item || typeof item !== 'object' || !item.jid || !item.razon) return
    const numero = item.jid.replace(/[^0-9]/g, '')
    text += `${i + 1}. @${numero} (${item.razon})\n`
    mentions.push(item.jid)
  })

  if (mentions.length === 0)
    return m.reply('⚠️ No hay entradas válidas en la lista negra.')

  m.reply(text, null, {
    mentions
  })
}
handler.command = /^verln$/i
handler.rowner = true

export default handler
