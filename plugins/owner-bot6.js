// COMANDO: .checkall - Verifica admin en TODOS los grupos actuales
let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando');
  
  await m.reply('🔍 Verificando admin en todos los grupos actuales...');
  
  try {
    const groups = await conn.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);
    
    if (groupIds.length === 0) {
      return m.reply('❌ El bot no está en ningún grupo');
    }
    
    const botJid = conn.user.jid;
    let checkedGroups = 0;
    let adminGroups = 0;
    let requestsStarted = 0;
    
    await m.reply(`📊 Iniciando verificación de ${groupIds.length} grupos...\n⏳ Esto puede tomar unos minutos.`);
    
    // Procesar grupos con delay para evitar rate limit
    for (let i = 0; i < groupIds.length; i++) {
      const groupId = groupIds[i];
      checkedGroups++;
      
      try {
        // Delay entre grupos
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log(`[CHECKALL] Verificando grupo ${checkedGroups}/${groupIds.length}: ${groupId}`);
        
        const groupMetadata = await conn.groupMetadata(groupId).catch(error => {
          console.log(`[CHECKALL] Error metadata: ${error.message}`);
          return null;
        });
        
        if (!groupMetadata) {
          console.log(`[CHECKALL] Saltando grupo sin metadata`);
          continue;
        }
        
        const botParticipant = groupMetadata.participants.find(p => p.id === botJid);
        
        if (!botParticipant) {
          console.log(`[CHECKALL] Bot no encontrado en: ${groupMetadata.subject}`);
          continue;
        }
        
        const isAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
        
        if (isAdmin) {
          adminGroups++;
          console.log(`[CHECKALL] ✅ ${groupMetadata.subject} - Bot es admin`);
        } else {
          console.log(`[CHECKALL] ❌ ${groupMetadata.subject} - Bot NO es admin`);
          
          // Verificar si ya hay una solicitud activa
          if (global.adminRequests && global.adminRequests[groupId]) {
            console.log(`[CHECKALL] 🔄 Ya existe solicitud para: ${groupMetadata.subject}`);
          } else {
            console.log(`[CHECKALL] 🚀 Iniciando solicitud para: ${groupMetadata.subject}`);
            
            // Inicializar solicitud
            global.adminRequests = global.adminRequests || {};
            global.adminRequests[groupId] = {
              attempts: 0,
              maxAttempts: 5,
              interval: 10 * 60 * 1000, // 10 minutos
              finalWarning: 20 * 60 * 1000, // 20 minutos
              startTime: Date.now(),
              isTest: false,
              groupName: groupMetadata.subject || 'Grupo sin nombre'
            };
            
            requestsStarted++;
            
            // Iniciar solicitud con delay aleatorio para evitar spam
            const randomDelay = Math.random() * 10000 + 5000; // 5-15 segundos
            setTimeout(() => {
              sendAdminRequestFromCheck(conn, groupId);
            }, randomDelay);
          }
        }
        
      } catch (error) {
        console.error(`[CHECKALL] Error procesando grupo:`, error.message);
      }
    }
    
    // Enviar resumen
    let summary = `📊 *VERIFICACIÓN COMPLETADA*\n\n`;
    summary += `🔢 Grupos verificados: *${checkedGroups}*\n`;
    summary += `✅ Con admin: *${adminGroups}*\n`;
    summary += `❌ Sin admin: *${checkedGroups - adminGroups}*\n`;
    summary += `🚀 Solicitudes iniciadas: *${requestsStarted}*`;
    
    if (requestsStarted > 0) {
      summary += `\n\n⏰ Las solicitudes se enviarán en los próximos minutos con intervalos aleatorios.`;
      summary += `\n🔄 Usa \`.checkrequests\` para ver el estado.`;
    }
    
    await m.reply(summary);
    
  } catch (error) {
    console.error('[CHECKALL] Error general:', error.message);
    await m.reply(`❌ Error durante la verificación:\n\n${error.message}`);
  }
};

// Función para enviar solicitud desde verificación masiva
async function sendAdminRequestFromCheck(conn, groupId) {
  const request = global.adminRequests[groupId];
  if (!request) {
    console.log('❌ No se encontró solicitud para:', groupId);
    return;
  }
  
  const botJid = conn.user.jid;
  
  // Verificar si ya es admin antes de enviar
  try {
    const meta = await conn.groupMetadata(groupId).catch(() => null);
    if (!meta) {
      console.log('❌ No se pudo verificar metadata antes de enviar');
      delete global.adminRequests[groupId];
      return;
    }
    
    const botPart = meta.participants.find(p => p.id === botJid);
    
    if (botPart && (botPart.admin === 'admin' || botPart.admin === 'superadmin')) {
      delete global.adminRequests[groupId];
      console.log('✅ Bot ya es admin, cancelando solicitud');
      return;
    }
  } catch (error) {
    console.error('❌ Error verificando admin:', error.message);
  }
  
  request.attempts = 1; // Marcar como primer intento
  console.log(`📤 Enviando solicitud inicial a: ${request.groupName}`);
  
  // Obtener admins
  let admins = [];
  try {
    const meta = await conn.groupMetadata(groupId).catch(() => null);
    if (meta) {
      admins = meta.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);
    }
  } catch (error) {
    console.error('Error obteniendo admins:', error.message);
  }
  
  const message = `🧟‍♂️ *¡Hola! Soy KelokeBot*\n\n` +
                 `🩸 Necesito permisos de *administrador* para funcionar correctamente.\n` +
                 `⚰️ Sin estos permisos no puedo ejecutar muchos comandos.\n\n` +
                 `🕷️ *Funciones que requieren admin:*\n` +
                 `• Eliminar mensajes\n` +
                 `• Administrar miembros\n` +
                 `• Cambiar configuración del grupo\n` +
                 `• Detectar acciones de moderación\n\n` +
                 `⏰ Intentos restantes: *${request.maxAttempts - request.attempts}*\n` +
                 `🔄 Próximo recordatorio en 10 minutos`;
  
  try {
    if (admins.length > 0) {
      await conn.sendMessage(groupId, {
        text: `⚠️ *SOLICITUD DE PERMISOS* ⚠️\n\n${message}\n\n👥 Admins: ${admins.map(admin => `@${admin.split('@')[0]}`).join(' ')}`,
        mentions: admins
      });
    } else {
      await conn.sendMessage(groupId, { text: `⚠️ *SOLICITUD DE PERMISOS* ⚠️\n\n${message}` });
    }
    
    console.log(`✅ Solicitud enviada a: ${request.groupName}`);
    
    // Programar siguiente intento
    setTimeout(() => {
      // Usar la función principal de solicitud
      sendAdminRequest(conn, groupId);
    }, request.interval);
    
  } catch (error) {
    console.error(`❌ Error enviando solicitud inicial a ${request.groupName}:`, error.message);
    
    // Si hay rate limit, reintentar en 1 minuto
    if (error.message.includes('rate-overlimit')) {
      setTimeout(() => {
        sendAdminRequestFromCheck(conn, groupId);
      }, 60000);
    }
  }
}

// Importar función principal (necesaria para continuar el flujo)
async function sendAdminRequest(conn, groupId) {
  // Esta función debería ser la misma del archivo principal
  // Por simplicidad, voy a hacer que llame a la verificación cada vez
  console.log(`[CHECKALL] Continuando flujo normal para: ${groupId}`);
  
  const request = global.adminRequests[groupId];
  if (!request || request.attempts >= request.maxAttempts) return;
  
  request.attempts++;
  
  // Aquí iría la lógica completa de sendAdminRequest del archivo principal
  // Por ahora, programar siguiente intento
  if (request.attempts < request.maxAttempts) {
    setTimeout(() => {
      sendAdminRequest(conn, groupId);
    }, request.interval);
  }
}

handler.command = ['checkall', 'verificartodos'];
handler.tags = ['owner'];
handler.help = ['checkall'];
handler.owner = true;

export default handler;
