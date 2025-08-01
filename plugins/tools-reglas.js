// Comando .reglas
handler.help = ['reglas'];
handler.tags = ['group'];
handler.command = /^(reglas)$/i;
handler.group = true;

handler.handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  try {
    const metadata = await conn.groupMetadata(m.chat);
    const reglas = metadata.desc || 'Este grupo no tiene reglas establecidas.';
    
    await conn.sendMessage(m.chat, {
      text: `📜 *Reglas del grupo:*\n\n${reglas}`,
      mentions: [m.sender]
    });
  } catch (e) {
    console.error('Error obteniendo reglas:', e);
    await m.reply('❌ Error al obtener las reglas del grupo.');
  }
};

export default handler;
