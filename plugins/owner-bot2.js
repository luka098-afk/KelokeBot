// COMANDO: .status (CORREGIDO)
let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando');
  
  console.log('[STATUS] Iniciando comando status...');
  await m.reply('🔍 Verificando estado de admin en todos los grupos...');
  
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
    
    for (let groupId of groupIds) {
      totalGroups++;
      console.log(`[STATUS] Procesando grupo ${totalGroups}: ${groupId}`);
      
      try {
        const groupMetadata = await conn.groupMetadata(groupId);
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
        console.error(`[STATUS] Error en grupo:`, error);
        message += `❌ *Error obteniendo info*\n`;
        message += `   └ ID: ${groupId.split('@')[0]}...\n\n`;
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
      }
    }
    
    console.log('[STATUS] Enviando respuesta...');
    
    // Dividir mensaje si es muy largo
    if (message.length > 4000) {
      const parts = [];
      const lines = message.split('\n');
      let currentPart = '';
      
      for (let line of lines) {
        if ((currentPart + line + '\n').length > 3500) {
          parts.push(currentPart);
          currentPart = line + '\n';
        } else {
          currentPart += line + '\n';
        }
      }
      if (currentPart) parts.push(currentPart);
      
      for (let i = 0; i < parts.length; i++) {
        if (i === 0) {
          await m.reply(parts[i]);
        } else {
          await conn.sendMessage(m.chat, { 
            text: `📄 *Parte ${i + 1}/${parts.length}*\n\n${parts[i]}` 
          });
        }
        
        if (i < parts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    } else {
      await m.reply(message);
    }
    
    console.log('[STATUS] Comando completado');
    
  } catch (error) {
    console.error('[STATUS] Error general:', error);
    await m.reply(`❌ Error obteniendo información:\n\n${error.message}`);
  }
};

handler.command = ['status', 'estado'];
handler.tags = ['owner'];
handler.help = ['status'];
handler.owner = true;

export default handler;
