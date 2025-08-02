// COMANDO: .checkrequests
let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando');
  
  let message = '🔄 **SOLICITUDES DE ADMIN ACTIVAS**\n\n';
  
  if (!global.adminRequests) {
    message += '❌ Sistema no inicializado\n';
    message += '💡 Se activa automáticamente cuando el bot se une a grupos sin admin.';
    return m.reply(message);
  }
  
  const activeRequests = Object.keys(global.adminRequests);
  
  if (activeRequests.length === 0) {
    message += '✅ No hay solicitudes activas\n';
    message += '🤖 El bot tiene admin en todos los grupos.';
  } else {
    message += `📍 **GRUPOS CON SOLICITUDES: ${activeRequests.length}**\n\n`;
    
    for (let groupId of activeRequests) {
      const request = global.adminRequests[groupId];
      try {
        const groupMetadata = await conn.groupMetadata(groupId);
        const isTest = request.isTest ? ' 🧪' : '';
        const timeElapsed = Math.floor((Date.now() - request.startTime) / 60000);
        
        message += `⏰ **${groupMetadata.subject}**${isTest}\n`;
        message += `   └ Intentos: ${request.attempts}/${request.maxAttempts}\n`;
        message += `   └ Tiempo transcurrido: ${timeElapsed} min\n`;
        
        if (request.attempts < request.maxAttempts) {
          const nextInterval = request.isTest ? 15 : 600; // 15s para test, 10min para real
          const nextIn = Math.max(0, Math.ceil((nextInterval - ((Date.now() - request.startTime) / 1000)) % nextInterval));
          message += `   └ Próximo mensaje: ${nextIn}s\n`;
        } else {
          message += `   └ ⚠️ En fase final (esperando 20 min)\n`;
        }
        message += '\n';
        
      } catch (error) {
        message += `❌ **Grupo desconocido**\n`;
        message += `   └ Intentos: ${request.attempts}/${request.maxAttempts}\n\n`;
      }
    }
  }
  
  message += '\n🛠️ **COMANDOS:**\n';
  message += '• `.testadmin` - Probar sistema\n';
  message += '• `.stopadmin` - Detener solicitud\n';
  message += '• `.status` - Ver estado general';
  
  await m.reply(message);
};

handler.command = ['checkrequests', 'solicitudes'];
handler.tags = ['owner'];
handler.help = ['checkrequests'];
handler.owner = true;

export default handler;
