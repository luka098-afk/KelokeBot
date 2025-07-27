import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args, text, isAdmin }) => {
  const owners = ['262573496758272@lid', '119069730668723@lid'] // Lista de JIDs de dueños
  const sender = m.sender

  if (!owners.includes(sender)) {
    return m.reply(`⛔ Este comando solo puede usarlo el *dueño del bot*.`)
  }

  if (!text) return m.reply('⚠️ Usa: *.ln @usuario razón*')

  // Detectar al objetivo
  let target, targetRaw, targetName

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    target = m.mentionedJid[0]
    targetRaw = target.split('@')[0]
  } else {
    const matches = text.match(/@(\d{5,15})/)
    if (!matches) return m.reply('⚠️ Formato inválido. Usa: *.ln @usuario razón*')
    targetRaw = matches[1]
    target = `${targetRaw}@s.whatsapp.net`
  }

  const reason = text.split(' ').slice(1).join(' ') || 'Sin razón'
  const groupId = m.chat

  const dbPath = './database/listanegra.json'
  let listaNegra = []

  if (fs.existsSync(dbPath)) {
    try {
      listaNegra = JSON.parse(fs.readFileSync(dbPath))
    } catch (e) {
      listaNegra = []
    }
  }

  const yaAgregado = listaNegra.find(entry => entry.jid === target)
  if (yaAgregado) return m.reply('⚠️ Esa persona ya está en la lista negra.')

  listaNegra.push({
    jid: target,
    razon: reason,
    agregadoPor: sender,
    grupo: groupId,
    fecha: new Date().toISOString()
  })

  fs.writeFileSync(dbPath, JSON.stringify(listaNegra, null, 2))

  await m.reply(`✅ @${targetRaw} ha sido agregado a la lista negra por: *${reason}*`, null, {
    mentions: [target]
  })

  console.log('INTENTANDO ELIMINAR A:', target)

  try {
    await conn.groupParticipantsUpdate(groupId, [target], 'remove')
  } catch (e) {
    console.log('❌ Error al eliminar:', e)
    await m.reply('⚠️ No pude eliminar al usuario. ¿El bot es admin?')
  }
}

handler.command = ['ln']
handler.group = true
handler.botAdmin = true
handler.register = true

export default handler
