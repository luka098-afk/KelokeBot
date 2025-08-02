// Comando para detener la prueba de admin
let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando');
  if (!m.isGroup) return m.reply('❌ Solo funciona en grupos');
  
  const groupId = m.chat;
  
  if (global.adminRequests && global.adminRequests[groupId]) {
    delete global.adminRequests[groupId];
    await m.reply('🛑 **PRUEBA DETENIDA**\n\n✅ Sistema de solicitud de admin desactivado para este grupo.');
  } else {
    await m.reply('❌ No hay ninguna solicitud activa en este grupo.');
  }
};

handler.command = ['stopadmin', 'deteneradmin'];
handler.tags = ['owner'];
handler.help = ['stopadmin'];
handler.owner = true;

export default handler;
