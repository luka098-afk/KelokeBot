import fetch from 'node-fetch'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Por favor escribe el nombre de usuario de Instagram.\nEjemplo: .ig felipebaliski')

  try {
    let res = await fetch(`https://www.instagram.com/${text}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}: Usuario no encontrado o perfil no accesible`)
    let html = await res.text()
    if (!html || html.length < 100) throw new Error('Respuesta vacía o inválida de Instagram')

    // Buscar la URL de la imagen de perfil
    let imageMatch = html.match(/<meta property="og:image" content="(.*?)"/)
    let fotoPerfil = imageMatch ? imageMatch[1] : null
    if (!fotoPerfil) throw new Error('No se pudo obtener la foto de perfil')

    // Descargar imagen
    let buffer = await fetch(fotoPerfil).then(res => res.buffer())
    let tipo = await fileTypeFromBuffer(buffer)
    let ext = tipo?.ext || 'jpg'
    let filename = join('./tmp', `igpf_${text}.${ext}`)

    await writeFile(filename, buffer)

    let message = `
📸 *Instagram:* https://instagram.com/${text}
🔍 *Usuario:* @${text}
🖼️ *Foto de perfil:*
    `.trim()

    await conn.sendMessage(m.chat, {
      image: { url: filename },
      caption: message
    }, { quoted: m })

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
