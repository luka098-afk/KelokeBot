// Detector cuando el bot se une a grupos - VERSIÓN CORREGIDA
let handler = async (m, { conn }) => {
  // Detectar múltiples tipos de eventos
  if (m.messageStubType) {
    const botJid = conn.user.jid;
    const groupId = m.chat;
    
    console.log(`📱 Evento: ${m.messageStubType} | Grupo: ${groupId}`);
    
    // Eventos de participantes: 27=añadido, 32=unión por link, 28=salió
    if ([27, 32].includes(m.messageStubType)) {
      const participants = m.messageStubParameters || [];
      console.log(`👥 Participantes afectados:`, participants);
      
      // Verificar si el bot está entre los participantes
      const botWasAdded = participants.some(jid => {
        const normalizedJid = jid.replace('@s.whatsapp.net', '@c.us');
        const normalizedBotJid = botJid.replace('@s.whatsapp.net', '@c.us');
        return normalizedJid === normalizedBotJid || jid.includes(botJid.split('@')[0]);
      });
      
      if (botWasAdded) {
        console.log('🤖 ¡BOT AÑADIDO AL GRUPO!');
        await handleBotJoined(conn, groupId);
      }
    }
  }
  
  // También detectar cuando el bot envía su primer mensaje en un grupo nuevo
  if (m.isGroup && m.fromMe && !global.processedGroups) {
    global.processedGroups = new Set();
  }
  
  if (m.isGroup && !m.fromMe && !global.processedGroups?.has(m.chat)) {
    console.log('🔍 Verificando nuevo grupo detectado...');
    global.processedGroups = global.processedGroups || new Set();
    global.processedGroups.add(m.chat);
    
    // Verificar si el bot necesita admin
    setTimeout(async () => {
      await checkAdminStatus(conn, m.chat);
    }, 5000);
  }
};

// Función para manejar cuando el bot se une
async function handleBotJoined(conn, groupId) {
  try {
    console.log('⏳ Esperando metadata del grupo...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await checkAdminStatus(conn, groupId);
  } catch (error) {
    console.error('❌ Error en handleBotJoined:', error);
  }
}

// Función para verificar estado de admin
async function checkAdminStatus(conn, groupId) {
  try {
    const groupMetadata = await conn.groupMetadata(groupId);
    const botJid = conn.user.jid;
    const botParticipant = groupMetadata.participants.find(p => p.id === botJid);
    
    if (!botParticipant) {
      console.log('❌ Bot no encontrado en participantes');
      return;
    }
    
    const isAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
    
    console.log(`🔐 Estado admin: ${isAdmin ? 'SÍ' : 'NO'}`);
    
    if (isAdmin) {
      console.log('✅ Bot ya es admin');
      await conn.sendMessage(groupId, {
        text: `🧟‍♂️ *¡Hola! Soy KelokeBot*\n\n✅ Tengo permisos de administrador\n🩸 ¡Listo para ayudar!\n⚰️ Usa \`.menu\` para ver comandos`
      });
      return;
    }
    
    console.log('⚠️ Iniciando sistema de solicitud admin...');
    await initAdminRequest(conn, groupId);
    
  } catch (error) {
    console.error('❌ Error verificando admin:', error);
  }
}

// Función para inicializar solicitud de admin
async function initAdminRequest(conn, groupId) {
  // Si ya existe una solicitud, no crear otra
  if (global.adminRequests && global.adminRequests[groupId]) {
    console.log('🔄 Solicitud ya existe para este grupo');
    return;
  }
  
  global.adminRequests = global.adminRequests || {};
  global.adminRequests[groupId] = {
    attempts: 0,
    maxAttempts: 5,
    interval: 10 * 60 * 1000, // 10 minutos
    finalWarning: 20 * 60 * 1000, // 20 minutos
    startTime: Date.now(),
    isTest: false
  };
  
  console.log('🚀 Sistema de solicitud inicializado');
  await executeAdminRequest(conn, groupId);
}

// Función principal de solicitud
async function executeAdminRequest(conn, groupId) {
  const request = global.adminRequests[groupId];
  if (!request) return;
  
  const botJid = conn.user.jid;
  
  // Verificar si ya es admin antes de cada intento
  try {
    const meta = await conn.groupMetadata(groupId);
    const botPart = meta.participants.find(p => p.id === botJid);
    
    if (botPart && (botPart.admin === 'admin' || botPart.admin === 'superadmin')) {
      delete global.adminRequests[groupId];
      console.log('✅ Bot ya es admin, deteniendo solicitudes');
      
      await conn.sendMessage(groupId, {
        text: '✅ *¡Perfecto!*\n\n🧟‍♂️ KelokeBot ya tiene permisos de administrador.\n🩸 Ahora puedo funcionar correctamente.\n⚰️ ¡Gracias por la confianza!'
      });
      return;
    }
  } catch (error) {
    console.error('Error verificando admin:', error);
  }
  
  request.attempts++;
  console.log(`📤 Enviando intento ${request.attempts}/${request.maxAttempts}`);
  
  // Obtener admins del grupo
  let admins = [];
  try {
    const meta = await conn.groupMetadata(groupId);
    admins = meta.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
  } catch (error) {
    console.error('Error obteniendo admins:', error);
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
    
    // Enviar mensaje final
    if (admins.length > 0) {
      await conn.sendMessage(groupId, {
        text: `🚨🚨🚨 *SOLICITUD DE PERMISOS* 🚨🚨🚨\n\n${message}\n\n👥 Admins: ${admins.map(admin => `@${admin.split('@')[0]}`).join(' ')}`,
        mentions: admins
      });
    } else {
      await conn.sendMessage(groupId, { text: message });
    }
    
    // Programar salida final
    setTimeout(async () => {
      if (!global.adminRequests[groupId]) return;
      
      try {
        const meta = await conn.groupMetadata(groupId);
        const botPart = meta.participants.find(p => p.id === botJid);
        
        if (botPart && (botPart.admin === 'admin' || botPart.admin === 'superadmin')) {
          delete global.adminRequests[groupId];
          return;
        }
        
        await conn.sendMessage(groupId, {
          text: `💀 *TIEMPO AGOTADO* 💀\n\n🧟‍♂️ No recibí permisos de administrador.\n⚰️ Me retiro del grupo.\n🩸 Si me quieren de vuelta, añádanme con permisos de admin.\n\n☠️ ¡Hasta la vista, mortales!`
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await conn.groupLeave(groupId);
        delete global.adminRequests[groupId];
        
      } catch (error) {
        console.error('Error en salida final:', error);
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
  
  // Enviar mensaje
  try {
    if (admins.length > 0) {
      await conn.sendMessage(groupId, {
        text: `⚠️ *SOLICITUD DE PERMISOS* ⚠️\n\n${message}\n\n👥 Admins: ${admins.map(admin => `@${admin.split('@')[0]}`).join(' ')}`,
        mentions: admins
      });
    } else {
      await conn.sendMessage(groupId, { text: message });
    }
  } catch (error) {
    console.error('Error enviando mensaje:', error);
  }
  
  // Programar siguiente intento
  if (request.attempts < request.maxAttempts) {
    setTimeout(() => {
      executeAdminRequest(conn, groupId);
    }, request.interval);
  }
}

handler.before = true;

export default handler;
