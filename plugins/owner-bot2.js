// Comando temporal para probar el sistema de admin
let handler = async (m, { conn, isOwner, isBotAdmin }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando de prueba');
  if (!m.isGroup) return m.reply('❌ Solo funciona en grupos');
  
  // Si ya es admin, simular que no lo es
  if (isBotAdmin) {
    await m.reply('⚠️ Soy admin aquí, pero simularé que no lo soy para la prueba...');
  }
  
  const groupId = m.chat;
  
  // Limpiar solicitud existente si hay una
  if (global.adminRequests && global.adminRequests[groupId]) {
    delete global.adminRequests[groupId];
    await m.reply('🗑️ Limpiando solicitud anterior...');
  }
  
  // Inicializar sistema de prueba con intervalos más cortos (30 segundos)
  global.adminRequests = global.adminRequests || {};
  global.adminRequests[groupId] = {
    attempts: 0,
    maxAttempts: 5,
    interval: 30 * 1000, // 30 segundos para prueba
    finalWarning: 60 * 1000, // 1 minuto para prueba
    startTime: Date.now(),
    isTest: true // Marcar como prueba
  };
  
  await m.reply('🧪 **INICIANDO PRUEBA DEL SISTEMA**\n\n⏰ Intervalos reducidos para prueba:\n• Recordatorios cada 30 segundos\n• Ultimátum de 1 minuto\n\n🔄 Iniciando...');
  
  // Función para obtener admins del grupo
  const getGroupAdmins = async () => {
    try {
      const groupMetadata = await conn.groupMetadata(groupId);
      const admins = groupMetadata.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);
      return admins;
    } catch (error) {
      console.error('Error obteniendo admins:', error);
      return [];
    }
  };
  
  // Función para enviar mensaje a admins (versión de prueba)
  const sendAdminMessage = async (message, isUrgent = false) => {
    try {
      const admins = await getGroupAdmins();
      if (admins.length === 0) return;
      
      const mentions = admins;
      const urgentEmoji = isUrgent ? '🚨🚨🚨' : '⚠️';
      const testLabel = '🧪 **[MODO PRUEBA]** 🧪\n\n';
      
      const fullMessage = `${testLabel}${urgentEmoji} *SOLICITUD DE PERMISOS* ${urgentEmoji}\n\n${message}\n\nAdmins: ${mentions.map(admin => `@${admin.split('@')[0]}`).join(' ')}`;
      
      await conn.sendMessage(groupId, {
        text: fullMessage,
        mentions: mentions
      });
    } catch (error) {
      console.error('Error enviando mensaje a admins:', error);
    }
  };
  
  // Función principal de solicitud (versión de prueba)
  const requestAdminLoop = async () => {
    const request = global.adminRequests[groupId];
    if (!request || !request.isTest) return;
    
    request.attempts++;
    
    if (request.attempts <= request.maxAttempts) {
      let message;
      
      if (request.attempts === 1) {
        message = `🧟‍♂️ *¡Hola! Soy KelokeBot*\n\n` +
                 `🩸 Necesito permisos de *administrador* para funcionar correctamente.\n` +
                 `⚰️ Sin estos permisos no puedo ejecutar muchos comandos.\n\n` +
                 `🕷️ *Funciones que necesitan admin:*\n` +
                 `• Eliminar mensajes\n` +
                 `• Administrar miembros\n` +
                 `• Cambiar configuración del grupo\n` +
                 `• Detectar acciones de admin\n\n` +
                 `⏰ Intentos restantes: *${request.maxAttempts - request.attempts}*\n` +
                 `🔄 Próximo recordatorio en 30 segundos (prueba)`;
      } else if (request.attempts === request.maxAttempts) {
        // Último intento
        message = `🚨 *¡ÚLTIMA OPORTUNIDAD!* 🚨\n\n` +
                 `🧟‍♂️ Este es mi último recordatorio.\n` +
                 `⚰️ Si no recibo permisos de admin en el próximo *1 minuto*, me saldría automáticamente del grupo.\n\n` +
                 `🩸 Por favor, otórguenme permisos de administrador para continuar.\n` +
                 `☠️ Tiempo límite: *1 minuto (prueba)*`;
        
        await sendAdminMessage(message, true);
        
        // Simular espera final
        setTimeout(async () => {
          const currentRequest = global.adminRequests[groupId];
          if (!currentRequest || !currentRequest.isTest) return;
          
          await conn.sendMessage(groupId, {
            text: `🧪 **[MODO PRUEBA]** 🧪\n\n💀 *TIEMPO AGOTADO* 💀\n\n` +
                 `🧟‍♂️ En modo real, me saldría del grupo ahora.\n` +
                 `⚰️ Pero como es una prueba, me quedo aquí.\n` +
                 `🩸 ¡Prueba completada exitosamente!`
          });
          
          // Limpiar solicitud de prueba
          delete global.adminRequests[groupId];
          
        }, request.finalWarning);
        
        return;
      } else {
        message = `⚠️ *Recordatorio ${request.attempts}/${request.maxAttempts}*\n\n` +
                 `🧟‍♂️ Sigo esperando permisos de administrador.\n` +
                 `🕷️ Sin estos permisos mi funcionalidad está limitada.\n\n` +
                 `⏰ Intentos restantes: *${request.maxAttempts - request.attempts}*\n` +
                 `🔄 Próximo recordatorio en 30 segundos (prueba)`;
      }
      
      await sendAdminMessage(message);
      
      // Programar siguiente intento
      if (request.attempts < request.maxAttempts) {
        setTimeout(() => {
          requestAdminLoop();
        }, request.interval);
      }
    }
  };
  
  // Iniciar el proceso de prueba
  setTimeout(() => {
    requestAdminLoop();
  }, 2000); // Esperar 2 segundos antes de empezar
};

handler.command = ['testadmin', 'pruebaadmin'];
handler.tags = ['owner'];
handler.help = ['testadmin'];
handler.owner = true;

export default handler;
