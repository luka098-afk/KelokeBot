// Detector de cuando añaden el bot a grupos - VERSIÓN SIN ERRORES
export async function before(m, { conn }) {
  // Solo procesar en grupos
  if (!m.isGroup) return;
  
  const botJid = conn.user.jid;
  const groupId = m.chat;
  
  console.log(`[DEBUG] Mensaje en grupo: ${groupId}`);
  console.log(`[DEBUG] Tipo: ${m.messageStubType}`);
  console.log(`[DEBUG] Parámetros:`, m.messageStubParameters);
  
  // Detectar eventos de participantes - AMPLIADO
  if (m.messageStubType) {
    // 20 = cambios en grupo, 27 = añadido, 32 = se unió por link, 28 = salió
    if ([20, 27, 32].includes(m.messageStubType)) {
      const participants = m.messageStubParameters || [];
      console.log(`[DEBUG] Participantes en evento:`, participants);
      
      // Verificar si el bot fue añadido
      const botNumber = botJid.split('@')[0];
      const botWasAdded = participants.some(jid => {
        const participantNumber = jid.split('@')[0];
        console.log(`[DEBUG] Comparando: ${participantNumber} vs ${botNumber}`);
        return participantNumber === botNumber;
      });
      
      if (botWasAdded) {
        console.log('🤖 ¡BOT AÑADIDO! Iniciando verificación...');
        setTimeout(() => checkAndRequestAdmin(conn, groupId), 5000);
        return;
      }
    }
  }
  
  // Método alternativo: detectar primer mensaje en grupo nuevo
  if (!global.checkedGroups) global.checkedGroups = new Set();
  
  if (!global.checkedGroups.has(groupId)) {
    console.log(`[DEBUG] Nuevo grupo detectado: ${groupId}`);
    global.checkedGroups.add(groupId);
    setTimeout(() => checkAndRequestAdmin(conn, groupId), 3000);
  }
}

// Función para verificar admin y solicitar si es necesario
async function checkAndRequestAdmin(conn, groupId) {
  console.log(`[DEBUG] Verificando admin en: ${groupId}`);
  
  try {
    // Usar un retraso para evitar rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const groupMetadata = await conn.groupMetadata(groupId).catch(error => {
      console.log(`[DEBUG] Error obteniendo metadata: ${error.message}`);
      return null;
    });
    
    if (!groupMetadata) {
      console.log('❌ No se pudo obtener metadata del grupo');
      return;
    }
    
    const botJid = conn.user.jid;
    
    console.log(`[DEBUG] Buscando bot: ${botJid}`);
    console.log(`[DEBUG] Participantes:`, groupMetadata.participants.map(p => p.id));
    
    const botParticipant = groupMetadata.participants.find(p => p.id === botJid);
    
    if (!botParticipant) {
      console.log('❌ Bot no encontrado en participantes');
      return;
    }
    
    const isAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
    console.log(`[DEBUG] ¿Es admin?: ${isAdmin}`);
    
    if (isAdmin) {
      console.log('✅ Bot ya es admin');
      
      // Enviar mensaje de bienvenida con retraso
      setTimeout(async () => {
        try {
          await conn.sendMessage(groupId, {
            text: `🧟‍♂️ *¡Hola! Soy KelokeBot*\n\n✅ Tengo permisos de administrador\n🩸 ¡Listo para ayudar!\n⚰️ Usa \`.menu\` para ver comandos`
          });
        } catch (error) {
          console.log('Error enviando mensaje de bienvenida:', error.message);
        }
      }, 3000);
      return;
    }
    
    console.log('⚠️ Bot SIN admin. Iniciando solicitudes...');
    
    // Verificar si ya hay una solicitud activa
    if (global.adminRequests && global.adminRequests[groupId]) {
      console.log('🔄 Ya existe solicitud para este grupo');
      return;
    }
    
    // Inicializar solicitud
    global.adminRequests = global.adminRequests || {};
    global.adminRequests[groupId] = {
      attempts: 0,
      maxAttempts: 5,
      interval: 10 * 60 * 1000, // 10 minutos
      finalWarning: 20 * 60 * 1000, // 20 minutos
      startTime: Date.now(),
      isTest: false
    };
    
    console.log('🚀 Iniciando primer mensaje...');
    
    // Enviar primer mensaje con retraso
    setTimeout(() => {
      sendAdminRequest(conn, groupId);
    }, 5000);
    
  } catch (error) {
    console.error('❌ Error en checkAndRequestAdmin:', error.message);
  }
}

// Función para enviar solicitud de admin
async function sendAdminRequest(conn, groupId) {
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
      console.log('✅ Bot ya es admin, cancelando solicitudes');
      
      try {
        await conn.sendMessage(groupId, {
          text: '✅ *¡Perfecto!*\n\n🧟‍♂️ KelokeBot ya tiene permisos de administrador.\n🩸 Ahora puedo funcionar correctamente.\n⚰️ ¡Gracias por la confianza!'
        });
      } catch (error) {
        console.log('Error enviando mensaje de confirmación:', error.message);
      }
      return;
    }
  } catch (error) {
    console.error('Error verificando admin:', error.message);
  }
  
  request.attempts++;
  console.log(`📤 Enviando intento ${request.attempts}/${request.maxAttempts}`);
  
  // Obtener admins con manejo de errores
  let admins = [];
  try {
    const meta = await conn.groupMetadata(groupId).catch(() => null);
    if (meta) {
      admins = meta.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);
      console.log(`[DEBUG] Admins encontrados:`, admins);
    }
  } catch (error) {
    console.error('Error obteniendo admins:', error.message);
  }
  
  let message;
  
  if (request.attempts === 1) {
    message = `🧟‍♂️ *¡Hola! Soy KelokeBot*\n\n` +
             `🩸 Necesito permisos de *administrador* para funcionar correctamente.\n` +
             `⚰️ Sin estos permisos no puedo ejecutar muchos comandos.\n\n` +
             `🕷️ *Funciones que requieren admin:*\n` +
             `• Eliminar mensajes\n` +
             `• Administrar miembros\n` +
             `• Cambiar configuración del grupo\n` +
             `• Detectar acciones de moderación\n\n` +
             `⏰ Intentos restantes: *${request.maxAttempts - request.attempts}*\n` +
             `🔄 Próximo recordatorio en 10 minutos`;
  } else if (request.attempts === request.maxAttempts) {
    message = `🚨 *¡ÚLTIMA OPORTUNIDAD!* 🚨\n\n` +
             `🧟‍♂️ Este es mi último recordatorio.\n` +
             `⚰️ Si no recibo permisos de admin en los próximos *20 minutos*, me saldré automáticamente.\n\n` +
             `🩸 Por favor, otórguenme permisos de administrador.\n` +
             `☠️ Tiempo límite: *20 minutos*`;
    
    // Enviar mensaje urgente
    try {
      if (admins.length > 0) {
        await conn.sendMessage(groupId, {
          text: `🚨🚨🚨 *SOLICITUD DE PERMISOS* 🚨🚨🚨\n\n${message}\n\n👥 Admins: ${admins.map(admin => `@${admin.split('@')[0]}`).join(' ')}`,
          mentions: admins
        });
      } else {
        await conn.sendMessage(groupId, { text: message });
      }
      console.log('✅ Mensaje urgente enviado');
    } catch (error) {
      console.error('❌ Error enviando mensaje urgente:', error.message);
    }
    
    // Programar salida
    setTimeout(async () => {
      if (!global.adminRequests[groupId]) return;
      
      try {
        const meta = await conn.groupMetadata(groupId).catch(() => null);
        if (!meta) {
          delete global.adminRequests[groupId];
          return;
        }
        
        const botPart = meta.participants.find(p => p.id === botJid);
        
        if (botPart && (botPart.admin === 'admin' || botPart.admin === 'superadmin')) {
          delete global.adminRequests[groupId];
          return;
        }
        
        await conn.sendMessage(groupId, {
          text: `💀 *TIEMPO AGOTADO* 💀\n\n🧟‍♂️ No recibí permisos de administrador.\n⚰️ Me retiro del grupo.\n🩸 Si me quieren de vuelta, añádanme con permisos de admin.\n\n☠️ ¡Hasta la vista, mortales!`
        });
        
        setTimeout(async () => {
          try {
            await conn.groupLeave(groupId);
            delete global.adminRequests[groupId];
            console.log('🚪 Bot salió del grupo por falta de admin');
          } catch (error) {
            console.error('Error saliendo del grupo:', error.message);
          }
        }, 3000);
        
      } catch (error) {
        console.error('Error en verificación final:', error.message);
        delete global.adminRequests[groupId];
      }
    }, request.finalWarning);
    
    return;
  } else {
    message = `⚠️ *Recordatorio ${request.attempts}/${request.maxAttempts}*\n\n` +
             `🧟‍♂️ Sigo esperando permisos de administrador.\n` +
             `🕷️ Sin estos permisos mi funcionalidad está limitada.\n\n` +
             `⏰ Intentos restantes: *${request.maxAttempts - request.attempts}*\n` +
             `🔄 Próximo recordatorio en 10 minutos`;
  }
  
  // Enviar mensaje con manejo de errores
  try {
    if (admins.length > 0) {
      await conn.sendMessage(groupId, {
        text: `⚠️ *SOLICITUD DE PERMISOS* ⚠️\n\n${message}\n\n👥 Admins: ${admins.map(admin => `@${admin.split('@')[0]}`).join(' ')}`,
        mentions: admins
      });
    } else {
      await conn.sendMessage(groupId, { text: message });
    }
    
    console.log('✅ Mensaje enviado correctamente');
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error.message);
    
    // Si hay error de rate limit, reintentar en 30 segundos
    if (error.message.includes('rate-overlimit')) {
      console.log('⏰ Rate limit detectado, reintentando en 30 segundos...');
      setTimeout(() => {
        sendAdminRequest(conn, groupId);
      }, 30000);
      return;
    }
  }
  
  // Programar siguiente intento
  if (request.attempts < request.maxAttempts) {
    console.log(`⏰ Programando siguiente intento en ${request.interval / 60000} minutos`);
    setTimeout(() => {
      sendAdminRequest(conn, groupId);
    }, request.interval);
  }
}
