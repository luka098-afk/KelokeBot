import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Por favor escribe el nombre de usuario de Instagram.\nEjemplo: .ig felipebaliski')

  try {
    let res = await fetch(`https://www.instagram.com/${text}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}: Usuario no encontrado o perfil no accesible`)

    let html = await res.text()
    if (!html || html.length < 100) throw new Error('Respuesta vacía o inválida de Instagram')

    // Extraer info de meta tags
    let imageMatch = html.match(/<meta property="og:image" content="(.*?)"/)
    let descMatch = html.match(/<meta property="og:description" content="(.*?)"/)
    let titleMatch = html.match(/<title>(.*?)<\/title>/)

    let fotoPerfil = imageMatch ? imageMatch[1] : null
    if (!fotoPerfil) throw new Error('No se encontró la foto de perfil')

    let perfilUrl = `https://instagram.com/${text}`

    // Comprobar si es privado
    const esPrivado = descMatch && descMatch[1].includes('Private Account')

    if (esPrivado) {
      let messagePrivado = `
🔒 *Cuenta privada detectada*
📸 *Instagram:* ${perfilUrl}
🔍 *Usuario:* @${text}
🖼️ *Foto de perfil a continuación...*
      `.trim()

      await conn.sendMessage(m.chat, {
        image: { url: fotoPerfil },
        caption: messagePrivado
      }, { quoted: m })
    } else {
      // Si es público
      let nombre = titleMatch ? titleMatch[1].replace(/\(@.*?\).*/, '').trim() : 'Sin nombre'
      let bio = descMatch ? descMatch[1].trim() : 'Sin biografía'

      let messagePublico = `
📸 *Instagram:* ${perfilUrl}
👤 *Nombre:* ${nombre}
📝 *Bio:* ${bio}
🔍 *Usuario:* @${text}
      `.trim()

      await conn.sendMessage(m.chat, {
        image: { url: fotoPerfil },
        caption: messagePublico
      }, { quoted: m })
    }

  } catch (e) {
    console.error('Error detallado:', e.message)

    let errorMessage = `
❌ No se pudo obtener el perfil de @${text}

🔍 Asegúrate de que:
• El nombre de usuario sea correcto
• El perfil no esté restringido o eliminado

🔗 Enlace: https://instagram.com/${text}
    `.trim()

    m.reply(errorMessage)
  }
}

handler.command = /^ig$/i
handler.register = true

export default handler
