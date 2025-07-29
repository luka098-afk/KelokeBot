import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Por favor escribe el nombre de usuario de Instagram.\nEjemplo: .ig felipebaliski')

  try {
    let res = await fetch(`https://www.instagram.com/${text}/?__a=1&__d=dis`)
    if (!res.ok) throw new Error('Usuario no encontrado o perfil privado.')

    let json = await res.json()
    let user = json.graphql.user

    let nombre = user.full_name || 'Sin nombre'
    let bio = user.biography || 'Sin biografía'
    let seguidores = user.edge_followed_by.count || 0
    let seguidos = user.edge_follow.count || 0
    let publicaciones = user.edge_owner_to_timeline_media.count || 0
    let perfilUrl = `https://instagram.com/${text}`
    let fotoPerfil = user.profile_pic_url_hd || user.profile_pic_url

    let message = `
📸 *Instagram:* ${perfilUrl}
👤 *Nombre:* ${nombre}
📝 *Bio:* ${bio}
⭐ *Seguidores:* ${seguidores}
👥 *Siguiendo:* ${seguidos}
📷 *Publicaciones:* ${publicaciones}
    `.trim()

    await conn.sendMessage(m.chat, { image: { url: fotoPerfil }, caption: message }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('❌ No se pudo obtener la información. Verifica que el usuario exista y sea público.')
  }
}

handler.command = /^ig$/i
handler.register = true

export default handler
