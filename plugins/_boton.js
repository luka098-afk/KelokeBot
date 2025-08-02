// Agregar este código en tu archivo principal o crear un nuevo plugin

// Manejador para el botón del canal
export async function before(m, { conn }) {
  if (m.isBaileys) return;
  
  if (m.message?.buttonsResponseMessage?.selectedButtonId === 'canal_oficial') {
    const channelLink = 'https://whatsapp.com/channel/0029VawwvsW7j6g1upS0i531';
    
    const msg = {
      text: `📢 *¡Únete a nuestro canal oficial!*\n\n${channelLink}\n\n✨ Mantente al día con las últimas actualizaciones del bot`,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          title: 'Canal Oficial',
          body: 'Únete ahora',
          thumbnailUrl: 'http://imgfz.com/i/ysZD3vi.jpeg',
          sourceUrl: channelLink,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    };
    
    await conn.sendMessage(m.chat, msg, { quoted: m });
    return true; // Detiene el procesamiento de otros plugins
  }
}
