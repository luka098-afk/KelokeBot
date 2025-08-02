// COMANDO: .stopadmin
let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando');
  if (!m.isGroup) return m.reply('❌ Solo funciona en grupos');
  
  const groupId = m.chat;
  
  if (global.adminRequests && global.adminRequests[groupId]) {
    const wasTest = global.adminRequests[groupId].isTest;
    delete global.adminRequests[groupId];
    const type = wasTest ? 'prueba' : 'solicitud';
    await m.reply(`🛑 **${type.toUpperCase()} DETENIDA**\n\n✅ Sistema desactivado para este grupo.`);
  } else {
    await m.reply('❌ No hay solicitudes activas en este grupo.');
  }
};

handler.command = ['stopadmin', 'deteneradmin'];
handler.tags = ['owner'];
handler.help = ['stopadmin'];
handler.owner = true;

export default handler;
