// COMANDO: .status (SIN RATE LIMIT)
let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando');
  
  console.log('[STATUS] Iniciando comando status...');
  await m.reply('🔍 Verificando estado de admin...');
  
  let message = `🧟‍♂️ *ESTADO DE ADMIN EN GRUPOS*\n\n`;
  let totalGroups = 0;
  let adminGroups = 0;
  let noAdminGroups = 0;
  
  try {
    console.log('[STATUS] Obteniendo grupos...');
    const groups = await conn.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);
    
    console.log(`[STATUS] Grupos encontrados: ${groupIds.length}`);
    
    if (groupIds.length === 0) {
      return m.reply('❌ El bot no está en ningún grupo');
    }
    
    const botJid = conn.user.jid;
    console.log(`[STATUS] Bot JID: ${botJid}`);
    
    // Procesar grupos con delay para evitar rate limit
    for (let i = 0; i < groupIds.length; i++) {
      const groupId = groupIds[i];
      totalGroups++;
      console.log(`[STATUS] Procesando grupo ${totalGroups}: ${groupId}`);
      
      try {
        // Delay entre solicitudes para evitar rate limit
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const groupMetadata = await conn.groupMetadata(groupId).catch(error => {
          console.log(`[STATUS] Error metadata: ${error.message}`);
          return null;
        });
        
        if (!groupMetadata) {
          message += `❌ *Error obteniendo info*\n`;
          message += `   └ ID: ${groupId.split('@')[0]}...\n\n`;
          continue;
        }
        
        console.log(`[STATUS] Metadata obtenida para: ${groupMetadata.subject}`);
        
        const botParticipant = groupMetadata.participants.find(p => p.id === botJid);
        
        if (!botParticipant) {
          console.log(`[STATUS] Bot no encontrado en: ${groupMetadata.subject}`);
          continue;
        }
        
        const isAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
        const isSuperAdmin = botParticipant.admin === 'superadmin';
        
        console.log(`[STATUS] ${groupMetadata.subject} - Admin: ${isAdmin}`);
        
        if (isAdmin) adminGroups++;
        else noAdminGroups++;
        
        let status = isSuperAdmin ? '👑 Super Admin' : isAdmin ? '✅ Admin' : '❌ Sin Admin';
        let emoji = isSuperAdmin ? '👑' : isAdmin ? '👤' : '🚫';
        
        message += `${emoji} *${groupMetadata.subject || 'Sin nombre'}*\n`;
        message += `   └ Estado: ${status}\n`;
        message += `   └ Miembros: ${groupMetadata.participants.length}\n\n`;
        
      } catch (error) {
        console.error(`[STATUS] Error en grupo:`, error.message);
        message += `❌ *Error obteniendo info*\n`;
        message += `   └ Error: ${error.message}\n\n`;
      }
    }
    
    // Resumen
    message += `📊 *RESUMEN*\n`;
    message += `🔢 Total: *${totalGroups}*\n`;
    message += `✅ Con admin: *${adminGroups}*\n`;
    message += `❌ Sin admin: *${noAdminGroups}*`;
    
    // Mostrar solicitudes activas si las hay
    if (global.adminRequests) {
      const activeRequests = Object.keys(global.adminRequests);
      if (activeRequests.length > 0) {
        message += `\n\n🔄 *SOLICITUDES ACTIVAS: ${activeRequests.length}*`;
        
        for (let groupId of activeRequests) {
          const request = global.adminRequests[groupId];
          try {
            const meta = await conn.groupMetadata(groupId).catch(() => null);
            if (meta) {
              message += `\n• ${meta.subject} (${request.attempts}/${request.maxAttempts})`;
            }
          } catch (error) {
            message += `\n• Grupo desconocido (${request.attempts}/${request.maxAttempts})`;
          }
        }
      }
    }
    
    console.log('[STATUS] Enviando respuesta...');
    
    // Dividir mensaje si es muy largo
    if (message.length > 4000) {
      const parts = [];
      let currentPart = '';
      const lines = message.split('\n');
      
      for (let line of lines) {
        if ((currentPart + line + '\n').length > 3500) {
          if (currentPart) parts.push(currentPart);
          currentPart = line + '\n';
        } else {
          currentPart += line + '\n';
        }
      }
      if (currentPart) parts.push(currentPart);
      
      for (let i = 0; i < parts.length; i++) {
        try {
          if (i === 0) {
            await m.reply(parts[i]);
          } else {
            await conn.sendMessage(m.chat, { 
              text: `📄 *Parte ${i + 1}/${parts.length}*\n\n${parts[i]}` 
            });
          }
          
          // Delay entre partes
          if (i < parts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error('Error enviando parte:', error.message);
        }
      }
    } else {
      try {
        await m.reply(message);
      } catch (error) {
        console.error('Error enviando mensaje completo:', error.message);
        await m.reply('❌ Error enviando respuesta completa. Intenta de nuevo.');
      }
    }
    
    console.log('[STATUS] Comando completado');
    
  } catch (error) {
    console.error('[STATUS] Error general:', error.message);
    await m.reply(`❌ Error obteniendo información:\n\n${error.message}`);
  }
};

handler.command = ['status', 'estado'];
handler.tags = ['owner'];
handler.help = ['status'];
handler.owner = true;

export default handler;
