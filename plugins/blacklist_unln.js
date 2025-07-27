import fs from 'fs'
import path from 'path'

let handler = async (m, { args }) => {
  const dbPath = './database/listanegra.json'
  let listaNegra = []

  try {
    listaNegra = JSON.parse(fs.readFileSync(dbPath))
  } catch {
    return m.reply('⚠️ La lista negra está vacía o no existe.')
  }

  if (!args[0]) return m.reply('⚠️ Debes indicar el número en la lista.\n*Ejemplo:* .unln 2')

  let index = parseInt(args[0]) - 1
  if (isNaN(index) || index < 0 || index >= listaNegra.length)
    return m.reply('❌ Número inválido.')

  let eliminado = listaNegra.splice(index, 1)[0]
  fs.writeFileSync(dbPath, JSON.stringify(listaNegra, null, 2))

  const numero = eliminado.jid.replace(/[^0-9]/g, '')
  m.reply(`✅ Eliminado de la lista negra:\n@${numero} (${eliminado.razon})`, null, {
    mentions: [eliminado.jid]
  })
}
handler.command = /^unln$/i
handler.rowner = true

export default handler
