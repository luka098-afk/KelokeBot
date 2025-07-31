import fetch from 'node-fetch'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Por favor escribe el nombre de usuario de Instagram.\nEjemplo: .ig felipebaliski')

  try {
    const perfilUrl = `https://www.instagram.com/${text}/`
    const res = await fetch(perfilUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}: Usuario no encontrado o perfil no accesible`)

    const html = await res.text()
    if (!html || html.length < 100) throw new Error('Respuesta vacía o inválida de Instagram')

    // Obtener la URL de la foto de perfil
    const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/)
    const fotoPerfil = imageMatch ? imageMatch[1] : null
    if (!fotoPerfil) throw new Error('No se pudo obtener la foto de perfil')

    // Descargar la imagen para enviarla (WhatsApp prefiere archivo real)
    const imgBuffer = await fetch(fotoPerfil).then(res => res.buffer())
    const fileInfo = await fileTypeFromBuffer(imgBuffer)
    const ext = fileInfo?.ext || 'jpg'
    const filename = join('./tmp', `igpf_${text}.${ext}`)

    await writeFile(filename, imgBuffer)

    const caption = `
📸 *Instagram:* https://instagram.com/${text}
🔍 *Usuario:* @${text}
🖼️ *Foto de perfil descargada a continuación...*
    `.trim()

    await conn.sendMessage(m.chat, {
      image: { url: filename },
      caption
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
