// Comando para verificar solicitudes de admin activas
let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando');
  
  let message = '📊 **ESTADO DEL SISTEMA DE ADMIN**\n\n';
  
  // Verificar si existe el objeto global
  if (!global.adminRequests) {
    message += '❌ No hay sistema de solicitudes inicializado\n';
    message += '💡 El sistema se activa automáticamente cuando el bot se une a un grupo sin permisos de admin.';
    return m.reply(message);
  }
  
  const activeRequests = Object.keys(global.adminRequests);
  
  if (activeRequests.length === 0) {
    message += '✅ No hay solicitudes activas\n';
    message += '🤖 El bot tiene admin en todos los grupos o no hay solicitudes pendientes.';
  } else {
    message += `🔄 **SOLICITUDES ACTIVAS: ${activeRequests.length}**\n\n`;
    
    for (let groupId of activeRequests) {
      const request = global.adminRequests[groupId];
      try {
        const groupMetadata = await conn.groupMetadata(groupId);
        const isTest = request.isTest ? ' 🧪' : '';
        
        message += `📍 **${groupMetadata.subject}**${isTest}\n`;
        message += `   └ Intentos: ${request.attempts}/${request.maxAttempts}\n`;
        message += `   └ Iniciado: ${new Date(request.startTime).toLocaleString()}\n`;
        message += `   └ Próximo: ${Math.round((request.interval - (Date.now() - request.startTime)) / 1000)}s\n\n`;
      } catch (error) {
        message += `❌ **Grupo desconocido**\n`;
        message += `   └ ID: ${groupId.slice(0, 20)}...\n`;
        message += `   └ Intentos: ${request.attempts}/${request.maxAttempts}\n\n`;
      }
    }
  }
  
  // Mostrar comandos disponibles
  message += '\n🛠️ **COMANDOS DISPONIBLES:**\n';
  message += '• `.testadmin` - Probar sistema (30s intervalos)\n';
  message += '• `.stopadmin` - Detener solicitud\n';
  message += '• `.adminstatus` - Estado en todos los grupos\n';
  message += '• `.checkadmin` - Ver este estado';
  
  await m.reply(message);
};

handler.command = ['checkadmin', 'estadosolicitudes'];
handler.tags = ['owner'];
handler.help = ['checkadmin'];
handler.owner = true;

export default handler;
