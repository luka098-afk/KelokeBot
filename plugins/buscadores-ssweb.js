import fetch from 'node-fetch'

let handler = async (m, { conn, command, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `🔍 Por favor, ingrese el Link de una página.`, m)
  }

  let waitMsg
  try {
    await m.react('⏳')
    
    // Validar y limpiar URL
    let url = args[0].trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    // Enviar mensaje de espera
    waitMsg = await conn.sendMessage(m.chat, {
      text: `🔍 Generando captura de pantalla de: ${url}`
    }, { quoted: m })
    
    console.log('📸 Capturando screenshot de:', url)
    
    // Intentar múltiples servicios
    let buffer
    let success = false
    
    // Servicio 1: Thum.io
    try {
      const response1 = await fetch(`https://image.thum.io/get/fullpage/${encodeURIComponent(url)}`)
      if (response1.ok) {
        buffer = await response1.buffer()
        if (buffer.length > 0) success = true
      }
    } catch (e) { console.log('Thum.io falló:', e.message) }
    
    // Servicio 2: Screenshot alternativo
    if (!success) {
      try {
        const response2 = await fetch(`https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${encodeURIComponent(url)}`)
        if (response2.ok) {
          buffer = await response2.buffer()
          if (buffer.length > 0) success = true
        }
      } catch (e) { console.log('S-shot falló:', e.message) }
    }
    
    // Servicio 3: Backup
    if (!success) {
      try {
        const response3 = await fetch(`https://api.screenshotmachine.com?key=demo&url=${encodeURIComponent(url)}&dimension=1024x768`)
        if (response3.ok) {
          buffer = await response3.buffer()
          if (buffer.length > 0) success = true
        }
      } catch (e) { console.log('ScreenshotMachine falló:', e.message) }
    }
    
    if (!success || !buffer) {
      throw new Error('No se pudo generar la captura desde ningún servicio')
    }
    
    // Editar el mensaje de espera con la imagen
    await conn.sendMessage(m.chat, {
      delete: waitMsg.key
    })
    
    // Enviar la imagen
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `🌐 *Screenshot de:* ${url}`
    }, { quoted: m })
    
    await m.react('✅')
    
  } catch (e) {
    console.error('❌ Error en ssweb:', e)
    await m.react('❌')
    
    // Si hay mensaje de espera, editarlo con el error
    if (waitMsg) {
      await conn.sendMessage(m.chat, {
        delete: waitMsg.key
      })
    }
    
    return conn.sendMessage(m.chat, {
      text: `⚠️ *Error al generar screenshot*\n\n• URL puede ser inválida\n• Sitio web no accesible\n• Servicios temporalmente no disponibles\n\n*Intenta con otra URL*`
    }, { quoted: m })
  }
}

handler.help = ['ssweb <url>', 'ss <url>']
handler.tags = ['tools']
handler.command = ['ssweb', 'ss']
handler.register = true

export default handler
