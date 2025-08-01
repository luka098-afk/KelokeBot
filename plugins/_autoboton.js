let handler = async (m, { conn }) => {
  // Este plugin se ejecuta después de otros comandos
  return true // No hace nada, solo existe para el after
}

handler.all = async function(m, { conn }) {
  // Solo si es una respuesta del bot (no mensaje de usuario)
  if (m.fromMe && m.isGroup) {
    const botonesActivos = global.botonesGrupos?.[m.chat] || false
    
    if (botonesActivos && m.text && !m.text.includes('📢 Canal')) {
      // Esperar un poco y reemplazar el mensaje
      setTimeout(async () => {
        try {
          await conn.sendMessage(m.chat, {
            text: m.text,
            footer: '🤖 Bot Actualizado',
            buttons: [
              {
                buttonId: '120363386229166956@newsletter',
                buttonText: { displayText: '📢 Canal' },
                type: 1
              }
            ],
            headerType: 1
          })
        } catch (e) {
          console.log('Error agregando botón automático:', e)
        }
      }, 100)
    }
  }
}

handler.command = false
export default handler
