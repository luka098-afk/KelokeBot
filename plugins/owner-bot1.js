// Detector principal cuando el bot se une a grupos
let handler = async (m, { conn }) => {
  // Solo procesar mensajes de sistema en grupos
  if (!m.isGroup || !m.messageStubType) return;
  
  const botJid = conn.user.jid;
  const groupId = m.chat;
  
  console.log(`📱 Evento detectado: ${m.messageStubType} en grupo`);
  
  // Eventos de interés:
  // 27 = Participante añadido
  // 32 = Participante se unió por link
  if (![27, 32].includes(m.messageStubType)) return;
  
  // Verificar si el bot fue el que se unió
  const participants = m.messageStubParameters || [];
  const botWasAdded = participants.some(jid => {
    const cleanJid = jid.replace(/[^0-9]/g, '');
    const cleanBotJid = botJid.replace(/[^0-9]/g, '');
    return cleanJid === cleanBotJid;
  });
  
  if (!botWasAdded) {
    console.log('👤 Otro usuario se unió, no el bot');
    return;
  }
  
  console.log('🤖 ¡Bot detectado uniéndose al grupo!');
  
  // Esperar un poco para que se actualice la metadata
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // Verificar si ya es admin
    const groupMetadata = await conn.groupMetadata(groupId);
    const botParticipant = groupMetadata.participants.find(p => p.id === botJid);
    
    if (!botParticipant) {
      console.log('❌ Bot no encontrado en participantes');
      return;
    }
    
    const isAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
    
    if (isAdmin) {
      console.log('✅ Bot ya tiene permisos de admin');
      await conn.sendMessage(groupId, {
        text: `🧟‍♂️ *¡Hola! Soy KelokeBot*\n\n✅ Tengo permisos de administrador\n🩸 ¡Listo para ayudar en este grupo!\n⚰️ Usa \`.menu\` para ver mis comandos`
      });
      return;
    }
    
    console.log('⚠️ Bot sin permisos de admin, iniciando solicitud...');
    
    // Si ya existe una solicitud activa, no crear otra
    if (global.adminRequests && global.adminRequests[groupId]) {
      console.log('🔄 Ya existe una solicitud activa');
      return;
    }
    
    // Inicializar sistema de solicitud
    global.adminRequests = global.adminRequests || {};
    global.adminRequests[groupId] = {
      attempts: 0,
      maxAttempts: 5,
      interval: 10 * 60 * 1000, // 10 minutos
      finalWarning: 20 * 60 * 1000, // 20 minutos  
      startTime: Date.now(),
      isTest: false
    };
    
    // Función para obtener admins
    const getGroupAdmins = async () => {
      try {
        const meta = await conn.groupMetadata(groupId);
        return meta.participants
          .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
          .map(p => p.id);
      } catch (error) {
        console.error('Error obteniendo admins:', error);
        return [];
      }
    };
    
    // Función para enviar mensaje a admins
    const sendAdminMessage = async (message, isUrgent = false) => {
      try {
        const admins = await getGroupAdmins();
        if (admins.length === 0) {
          await conn.sendMessage(groupId, { text: message });
          return;
        }
        
        const urgentEmoji = isUrgent ? '🚨🚨🚨' : '⚠️';
        const fullMessage = `${urgentEmoji} *SOLICITUD DE PERMISOS* ${urgentEmoji}\n\n${message}\n\n👥 Admins: ${admins.map(admin => `@${admin.split('@')[0]}`).join(' ')}`;
        
        await conn.sendMessage(groupId, {
          text: fullMessage,
          mentions: admins
        });
      } catch (error) {
        console.error('Error enviando mensaje:', error);
      }
    };
    
    // Función principal de solicitud
    const requestLoop = async () => {
      const request = global.adminRequests[groupId];
      if (!request) return;
      
      // Verificar si ya es admin antes de cada intento
      try {
        const meta = await conn.groupMetadata(groupId);
        const botPart = meta.participants.find(p => p.id === botJid);
        
        if (botPart && (botPart.admin === 'admin' || botPart.admin === 'superadmin')) {
          delete global.adminRequests[groupId];
          await sendAdminMessage('✅ *¡Perfecto!*\n\n🧟‍♂️ KelokeBot ya tiene permisos de administrador.\n🩸 Ahora puedo funcionar correctamente.\n⚰️ ¡Gracias por la confianza!');
          return;
        }
      } catch (error) {
        console.error('Error verificando admin:', error);
      }
      
      request.attempts++;
      
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
        
        await sendAdminMessage(message, true);
        
        // Programar salida automática
        setTimeout(async () => {
          const currentRequest = global.adminRequests[groupId];
          if (!currentRequest) return;
          
          try {
            const meta = await conn.groupMetadata(groupId);
            const botPart = meta.participants.find(p => p.id === botJid);
            
            if (botPart && (botPart.admin === 'admin' || botPart.admin === 'superadmin')) {
              delete global.adminRequests[groupId];
              return;
            }
            
            // Mensaje de despedida y salida
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
      
      await sendAdminMessage(message);
      
      // Programar siguiente intento
      if (request.attempts < request.maxAttempts) {
        setTimeout(requestLoop, request.interval);
      }
    };
    
    // Iniciar proceso inmediatamente
    console.log('🚀 Iniciando sistema de solicitud...');
    requestLoop();
    
  } catch (error) {
    console.error('Error en detector de unión:', error);
  }
};

handler.before = true;

export default handler;
