import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('⚠️ Por favor escribe el nombre de usuario de Instagram.\nEjemplo: .ig felipebaliski')

  try {
    // Método que funciona sin APIs de pago
    let res = await fetch(`https://www.instagram.com/${text}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
      }
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Usuario no encontrado o perfil no accesible`)
    }

    let html = await res.text()
    
    // Verificar si la respuesta es válida
    if (!html || html.length < 100) {
      throw new Error('Respuesta vacía o inválida de Instagram')
    }

    // Buscar datos JSON en el HTML
    let dataMatch = html.match(/<script type="application\/ld\+json">({.*?"@type":"Person".*?})<\/script>/)
    
    if (dataMatch) {
      // Método 1: JSON-LD data
      let jsonData = JSON.parse(dataMatch[1])
      let nombre = jsonData.name || 'Sin nombre'
      let bio = jsonData.description || 'Sin biografía'
      let fotoPerfil = jsonData.image || `https://www.instagram.com/${text}/profile.jpg`
      
      let message = `
📸 *Instagram:* https://instagram.com/${text}
👤 *Nombre:* ${nombre}
📝 *Bio:* ${bio}
🔍 *Usuario:* @${text}
      `.trim()

      await conn.sendMessage(m.chat, { 
        image: { url: fotoPerfil }, 
        caption: message 
      }, { quoted: m })
      return
    }

    // Método 2: Extraer del meta tags
    let titleMatch = html.match(/<title>(.*?)<\/title>/)
    let descMatch = html.match(/<meta property="og:description" content="(.*?)"/)
    let imageMatch = html.match(/<meta property="og:image" content="(.*?)"/)
    
    if (titleMatch || descMatch) {
      let nombre = titleMatch ? titleMatch[1].replace(/\(@.*?\).*/, '').trim() : 'Sin nombre'
      let bio = descMatch ? descMatch[1] : 'Sin biografía'
      let fotoPerfil = imageMatch ? imageMatch[1] : `https://instagram.com/${text}`
      
      // Limpiar el nombre del título
      if (nombre.includes('Instagram')) {
        nombre = nombre.split('(')[0].trim()
      }
      
      let message = `
📸 *Instagram:* https://instagram.com/${text}
👤 *Nombre:* ${nombre}
📝 *Bio:* ${bio}
🔍 *Usuario:* @${text}
      `.trim()

      await conn.sendMessage(m.chat, { 
        image: { url: fotoPerfil }, 
        caption: message 
      }, { quoted: m })
      return
    }

    // Si no se pudo extraer información específica
    let perfilUrl = `https://instagram.com/${text}`
    let message = `
📸 *Instagram:* ${perfilUrl}
🔍 *Usuario:* @${text}
✅ *Estado:* Perfil encontrado
ℹ️ *Nota:* No se pudieron extraer detalles adicionales (posible perfil privado)
    `.trim()

    await conn.sendMessage(m.chat, { 
      text: message
    }, { quoted: m })

  } catch (e) {
    console.error('Error detallado:', e.message)
    
    // Mensaje de error más útil
    let errorMessage = `
❌ Error al obtener información de @${text}

🔍 **Verifica que:**
• El nombre de usuario sea correcto
• El perfil sea público
• No tenga caracteres especiales

🔗 **Enlace directo:** https://instagram.com/${text}
    `.trim()
    
    m.reply(errorMessage)
  }
}

handler.command = /^ig$/i
handler.register = true

export default handler
