import fetch from 'node-fetch'
import Jimp from 'jimp'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '🌈', key: m.key } })

  try {
    let user
    if (m.mentionedJid?.length) {
      user = m.mentionedJid[0]
    } else if (m.quoted?.sender) {
      user = m.quoted.sender
    } else {
      user = m.sender
    }

    let name = await conn.getName(user)
    let ppUrl
    try {
      ppUrl = await conn.profilePictureUrl(user, 'image')
    } catch {
      ppUrl = null
    }

    if (!ppUrl) {
      return m.reply('❌ Este usuario no tiene foto de perfil visible.')
    }

    // Generar porcentaje aleatorio
    const porcentaje = Math.floor(Math.random() * 101)

    // Usamos la API que mencionaste
    const apiURL = `https://api.siputzx.my.id/api/canvas/gay?nama=${encodeURIComponent(name)}&avatar=${encodeURIComponent(ppUrl)}&num=${porcentaje}`

    const res = await fetch(apiURL)
    if (!res.ok) throw '*❌ Error al generar la imagen. Intenta de nuevo.*'

    const buffer = await res.arrayBuffer()

    await conn.sendMessage(m.chat, {
      image: Buffer.from(buffer),
      caption: `🏳️‍🌈 *DETECTOR GAY*\n\n👤 *Usuario:* @${user.split('@')[0]}\n📊 *Porcentaje:* ${porcentaje}%`,
      mentions: [user],
      quoted: m
    })
  } catch (err) {
    console.error(err)
    await m.reply(typeof err === 'string' ? err : '*❌ Ocurrió un error inesperado.*')
  } finally {
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  }
}

handler.help = ['gay']
handler.tags = ['maker', 'diversión']
handler.command = /^gay$/i
handler.limit = true
handler.register = true

export default handler
