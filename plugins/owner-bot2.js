// COMANDO 1: Estado general de admin en TODOS los grupos (.status)
let statusHandler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando');
  
  await m.reply('🔍 Verificando estado de admin en todos los grupos...');
  
  let message = `🧟‍♂️ *ESTADO DE ADMIN EN GRUPOS*\n\n`;
  let totalGroups = 0;
  let adminGroups = 0;
  let noAdminGroups = 0;
  
  try {
    const groups = await conn.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);
    
    if (groupIds.length === 0) {
      return m.reply('❌ El bot no está en ningún grupo');
    }
    
    for (let groupId of groupIds) {
      totalGroups++;
      
      try {
        const groupMetadata = await conn.groupMetadata(groupId);
        const botJid = conn.user.jid;
        const botParticipant = groupMetadata.participants.find(p => p.id === botJid);
        
        if (!botParticipant) continue;
        
        const isAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
        const isSuperAdmin = botParticipant.admin === 'superadmin';
        
        if (isAdmin) adminGroups++;
        else noAdminGroups++;
        
        let status = isSuperAdmin ? '👑 Super Admin' : isAdmin ? '✅ Admin' : '❌ Sin Admin';
        let emoji = isSuperAdmin ? '👑' : isAdmin ? '👤' : '🚫';
        
        message += `${emoji} *${groupMetadata.subject || 'Sin nombre'}*\n`;
        message += `   └ Estado: ${status}\n`;
        message += `   └ Miembros: ${groupMetadata.participants.length}\n\n`;
        
      } catch (error) {
        message += `❌ *Error obteniendo info*\n\n`;
      }
    }
    
    // Resumen
    message += `📊 *RESUMEN*\n`;
    message += `🔢 Total: *${totalGroups}* | ✅ Admin: *${adminGroups}* | ❌ Sin admin: *${noAdminGroups}*`;
    
    // Dividir mensaje si es muy largo
    if (message.length > 4000) {
      const chunks = message.match(/.{1,3500}(?=\n\n|$)/g) || [message];
      for (let i = 0; i < chunks.length; i++) {
        if (i === 0) {
          await m.reply(chunks[i]);
        } else {
          await conn.sendMessage(m.chat, { 
            text: `📄 *Continuación ${i + 1}/${chunks.length}*\n\n${chunks[i]}` 
          });
        }
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } else {
      await m.reply(message);
    }
    
  } catch (error) {
    await m.reply(`❌ Error: ${error.message}`);
  }
};

statusHandler.command = ['status', 'estado'];
statusHandler.tags = ['owner'];
statusHandler.help = ['status'];
statusHandler.owner = true;

// COMANDO 2: Estado de SOLICITUDES activas (.checkrequests)
let checkHandler = async (m, { conn, isOwner }) => {
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
          const nextIn = Math.max(0, Math.ceil((request.interval - (Date.now() - request.startTime)) / 1000));
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

checkHandler.command = ['checkrequests', 'solicitudes'];
checkHandler.tags = ['owner'];
checkHandler.help = ['checkrequests'];
checkHandler.owner = true;

// COMANDO 3: Probar sistema (.testadmin)
let testHandler = async (m, { conn, isOwner }) => {
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
    
    const admins = await conn.groupMetadata(groupId).then(meta => 
      meta.participants.filter(p => p.admin).map(p => p.id)
    ).catch(() => []);
    
    const message = `🧪 **PRUEBA ${request.attempts}/3**\n\n🧟‍♂️ Simulando solicitud de admin...\n⏰ Próximo en 15s`;
    
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
        m.reply('🧪 **PRUEBA COMPLETADA**\n\n✅ Sistema funcionando correctamente');
        delete global.adminRequests[groupId];
      }, 30000);
    }
  };
  
  setTimeout(testLoop, 3000);
};

testHandler.command = ['testadmin', 'pruebaadmin'];
testHandler.tags = ['owner'];
testHandler.help = ['testadmin'];
testHandler.owner = true;

// COMANDO 4: Detener solicitudes (.stopadmin)
let stopHandler = async (m, { conn, isOwner }) => {
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

stopHandler.command = ['stopadmin', 'deteneradmin'];
stopHandler.tags = ['owner'];
stopHandler.help = ['stopadmin'];
stopHandler.owner = true;

export { statusHandler as default, checkHandler, testHandler, stopHandler };
