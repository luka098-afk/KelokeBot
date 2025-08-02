// COMANDO: .testadmin
let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando');
  if (!m.isGroup) return m.reply('❌ Solo funciona en grupos');
  
  const groupId = m.chat;
  
  // Limpiar solicitud existente
  if (global.adminRequests && global.adminRequests[groupId]) {
    delete global.adminRequests[groupId];
  }
  
  global.adminRequests = global.adminRequests || {};
  global.adminRequests[groupId] = {
    attempts: 0,
    maxAttempts: 3,
    interval: 15 * 1000, // 15 segundos
    finalWarning: 30 * 1000, // 30 segundos
    startTime: Date.now(),
    isTest: true
  };
  
  await m.reply('🧪 **INICIANDO PRUEBA RÁPIDA**\n\n⏰ 3 intentos cada 15 segundos\n🔄 Iniciando en 3 segundos...');
  
  const testLoop = async () => {
    const request = global.adminRequests[groupId];
    if (!request || !request.isTest) return;
    
    request.attempts++;
    
    // Obtener admins
    let admins = [];
    try {
      const meta = await conn.groupMetadata(groupId);
      admins = meta.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);
    } catch (error) {
      console.error('Error obteniendo admins:', error);
    }
    
    const message = `🧪 **PRUEBA ${request.attempts}/3**\n\n🧟‍♂️ Simulando solicitud de admin...\n⏰ ${request.attempts < 3 ? 'Próximo en 15s' : 'Finalizando en 30s'}`;
    
    if (admins.length > 0) {
      await conn.sendMessage(groupId, {
        text: message + `\n\nAdmins: ${admins.map(a => `@${a.split('@')[0]}`).join(' ')}`,
        mentions: admins
      });
    } else {
      await m.reply(message);
    }
    
    if (request.attempts < 3) {
      setTimeout(testLoop, 15000);
    } else {
      setTimeout(() => {
        if (global.adminRequests[groupId] && global.adminRequests[groupId].isTest) {
          m.reply('🧪 **PRUEBA COMPLETADA**\n\n✅ Sistema funcionando correctamente');
          delete global.adminRequests[groupId];
        }
      }, 30000);
    }
  };
  
  setTimeout(testLoop, 3000);
};

handler.command = ['testadmin', 'pruebaadmin'];
handler.tags = ['owner'];
handler.help = ['testadmin'];
handler.owner = true;

export default handler;
