import fetch from 'node-fetch'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Escribe el nombre de usuario de Instagram. Ejemplo: .ig chesterbe')

  // Eliminar @ si el usuario lo pone
  text = text.replace(/^@/, '').trim()

  try {
    const perfilUrl = `https://www.instagram.com/${text}/`
    const res = await fetch(perfilUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/'
      }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status} - No se pudo acceder al perfil`)

    const html = await res.text()
    if (!html || html.length < 200) throw new Error('Contenido vacío o inválido.')

    // Intentar extraer la URL de la imagen desde el JSON embebido (más confiable)
    let imageMatch = html.match(/"profile_pic_url_hd":"([^"]+)"/) || html.match(/<meta property="og:image" content="(.*?)"/)
    if (!imageMatch) throw new Error('No se encontró imagen de perfil.')

    let fotoPerfil = imageMatch[1].replace(/\\u0026/g, '&')

    // Descargar imagen
    const buffer = await fetch(fotoPerfil).then(res => res.buffer())
    const tipo = await fileTypeFromBuffer(buffer)
    const ext = tipo?.ext || 'jpg'
    const filename = join('./tmp', `igpf_${text}.${ext}`)

    await writeFile(filename, buffer)

    const caption = `
📸 *Instagram:* https://instagram.com/${text}
🔍 *Usuario:* @${text}
🖼️ *Foto de perfil descargada:*
    `.trim()

    await conn.sendMessage(m.chat, {
      image: { url: filename },
      caption
    }, { quoted: m })

  } catch (e) {
    console.error('[❌ ERROR .ig]', e.message)

    const errorMessage = `
❌ No se pudo obtener el perfil de @${text}

🔍 Verifica que:
• El nombre de usuario exista
• El perfil esté disponible públicamente

🔗 https://instagram.com/${text}
    `.trim()

    m.reply(errorMessage)
  }
}

handler.command = /^ig$/i
handler.register = true

export default handler
