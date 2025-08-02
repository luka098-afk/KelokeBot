// DETECTOR COMPLETAMENTE CORREGIDO - ANÁLISIS PROFUNDO
let handler = async (m, { conn }) => {
  // MÉTODO 1: Detectar eventos de sistema
  if (m.messageStubType) {
    const botJid = conn.user.jid;
    const groupId = m.chat;
    
    console.log(`[DEEP-DEBUG] ============ EVENTO DETECTADO ============`);
    console.log(`[DEEP-DEBUG] Grupo: ${groupId}`);
    console.log(`[DEEP-DEBUG] Tipo evento: ${m.messageStubType}`);
    console.log(`[DEEP-DEBUG] Parámetros:`, m.messageStubParameters);
    console.log(`[DEEP-DEBUG] Bot JID: ${botJid}`);
    
    // Eventos que nos interesan: 20, 27, 32
    if ([20, 27, 32].includes(m.messageStubType)) {
      const participants = m.messageStubParameters || [];
      
      // Verificar si el bot fue añadido de múltiples formas
      const botNumber = botJid.split('@')[0];
      let botWasAdded = false;
      
      for (let participant of participants) {
        const participantNumber = participant.split('@')[0];
        console.log(`[DEEP-DEBUG] Comparando participante: ${participantNumber} con bot: ${botNumber}`);
        
        if (participantNumber === botNumber) {
          botWasAdded = true;
          console.log(`[DEEP-DEBUG] ✅ MATCH ENCONTRADO!`);
          break;
        }
      }
      
      if (botWasAdded) {
        console.log(`[DEEP-DEBUG] 🤖 BOT FUE AÑADIDO AL GRUPO!`);
        console.log(`[DEEP-DEBUG] Esperando 8 segundos antes de verificar admin...`);
        
        // Esperar más tiempo para que WhatsApp se sincronice
        setTimeout(async () => {
          console.log(`[DEEP-DEBUG] ⏰ Tiempo de espera completado, verificando admin...`);
          await verifyAndRequestAdmin(conn, groupId, true);
        }, 8000);
        
        return true; // Indicar que manejamos el evento
      }
    }
  }
  
  // MÉTODO 2: Detectar grupos donde el bot ya está pero no es admin
  if (m.isGroup && !m.fromMe) {
    const groupId = m.chat;
    
    // Inicializar conjunto de grupos verificados
    if (!global.deepCheckedGroups) {
      global.deepCheckedGroups = new Set();
    }
    
    // Solo verificar una vez por grupo
    if (!global.deepCheckedGroups.has(groupId)) {
      console.log(`[DEEP-DEBUG] 🔍 Nuevo grupo detectado para verificación: ${groupId}`);
      global.deepCheckedGroups.add(groupId);
      
      // Verificar admin con delay
      setTimeout(async () => {
        console.log(`[DEEP-DEBUG] ⏰ Verificando admin en grupo existente...`);
        await verifyAndRequestAdmin(conn, groupId, false);
      }, 5000);
    }
  }
};

// FUNCIÓN PRINCIPAL DE VERIFICACIÓN Y SOLICITUD
async function verifyAndRequestAdmin(conn, groupId, isNewJoin) {
  console.log(`[DEEP-DEBUG] ========== VERIFICANDO ADMIN ==========`);
  console.log(`[DEEP-DEBUG] Grupo: ${groupId}`);
  console.log(`[DEEP-DEBUG] Es nuevo join: ${isNewJoin}`);
  
  try {
    // Obtener metadata con múltiples intentos
    let groupMetadata = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!groupMetadata && attempts < maxAttempts) {
      attempts++;
      console.log(`[DEEP-DEBUG] Intento ${attempts}/${maxAttempts} obteniendo metadata...`);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        groupMetadata = await conn.groupMetadata(groupId);
        console.log(`[DEEP-DEBUG] ✅ Metadata obtenida exitosamente`);
      } catch (error) {
        console.log(`[DEEP-DEBUG] ❌ Error intento ${attempts}: ${error.message}`);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
        }
      }
    }
    
    if (!groupMetadata) {
      console.log(`[DEEP-DEBUG] ❌ FALLÓ: No se pudo obtener metadata después de ${maxAttempts} intentos`);
      return;
    }
    
    console.log(`[DEEP-DEBUG] 📊 Grupo: "${groupMetadata.subject}"`);
    console.log(`[DEEP-DEBUG] 👥 Participantes: ${groupMetadata.participants.length}`);
    
    // Verificar si el bot está en el grupo
    const botJid = conn.user.jid;
    console.log(`[DEEP-DEBUG] 🤖 Buscando bot: ${botJid}`);
    
    const botParticipant = groupMetadata.participants.find(p => {
      console.log(`[DEEP-DEBUG] Comparando: ${p.id} === ${botJid}`);
      return p.id === botJid;
    });
    
    if (!botParticipant) {
      console.log(`[DEEP-DEBUG] ❌ FALLÓ: Bot no encontrado en participantes`);
      console.log(`[DEEP-DEBUG] 📋 Participantes encontrados:`, groupMetadata.participants.map(p => p.id));
      return;
    }
    
    console.log(`[DEEP-DEBUG] ✅ Bot encontrado en participantes`);
    console.log(`[DEEP-DEBUG] 🔐 Rol del bot: ${botParticipant.admin || 'member'}`);
    
    const isAdmin = botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin';
    
    if (isAdmin) {
      console.log(`[DEEP-DEBUG] ✅ Bot YA es admin`);
      
      if (isNewJoin) {
        console.log(`[DEEP-DEBUG] 📤 Enviando mensaje de bienvenida...`);
        await sendWelcomeMessage(conn, groupId, groupMetadata.subject);
      }
      return;
    }
    
    console.log(`[DEEP-DEBUG] ⚠️ Bot NO es admin - iniciando solicitud`);
    
    // Verificar si ya hay solicitud activa
    if (global.adminRequests && global.adminRequests[groupId]) {
      console.log(`[DEEP-DEBUG] 🔄 Ya existe solicitud activa para este grupo`);
      return;
    }
    
    // Crear nueva solicitud
    global.adminRequests = global.adminRequests || {};
    global.adminRequests[groupId] = {
      attempts: 0,
      maxAttempts: 5,
      interval: 10 * 60 * 1000, // 10 minutos
      finalWarning: 20 * 60 * 1000, // 20 minutos
      startTime: Date.now(),
      isTest: false,
      groupName: groupMetadata.subject || 'Grupo sin nombre',
      isNewJoin: isNewJoin
    };
    
    console.log(`[DEEP-DEBUG] 📝 Solicitud creada para: ${groupMetadata.subject}`);
    console.log(`[DEEP-DEBUG] 🚀 Iniciando primer envío en 3 segundos...`);
    
    // Enviar primera solicitud
    setTimeout(async () => {
      await executeAdminRequest(conn, groupId);
    }, 3000);
    
  } catch (error) {
    console.error(`[DEEP-DEBUG] ❌ ERROR CRÍTICO en verifyAndRequestAdmin:`, error);
  }
}

// FUNCIÓN PARA ENVIAR MENSAJE DE BIENVENIDA
async function sendWelcomeMessage(conn, groupId, groupName) {
  console.log(`[DEEP-DEBUG] 📤 Preparando mensaje de bienvenida para: ${groupName}`);
  
  const welcomeText = `🧟‍♂️ *¡Hola! Soy KelokeBot*\n\n✅ Tengo permi.sos de administrador\n🩸 ¡Listo para ayudar!\n⚰️ Usa \`.menu\` para ver comandos`;
  
  try {
    await conn.sendMessage(groupId, {
      text: welcomeText
    });
    console.log(`[DEEP-DEBUG] ✅ Mensaje de bienvenida enviado exitosamente`);
  } catch (error) {
    console.error(`[DEEP-DEBUG] ❌ Error enviando bienvenida:`, error.message);
  }
}

// FUNCIÓN PARA EJECUTAR SOLICITUD DE ADMIN
async function executeAdminRequest(conn, groupId) {
  console.log(`[DEEP-DEBUG] ========== EJECUTANDO SOLICITUD ==========`);
  
  const request = global.adminRequests[groupId];
  if (!request) {
    console.log(`[DEEP-DEBUG] ❌ No se encontró solicitud para: ${groupId}`);
    return;
  }
  
  console.log(`[DEEP-DEBUG] 📊 Grupo: ${request.groupName}`);
  console.log(`[DEEP-DEBUG] 🔢 Intento actual: ${request.attempts}/${request.maxAttempts}`);
  
  // Verificar si ya es admin antes de enviar
  try {
    const meta = await conn.groupMetadata(groupId);
    const botJid = conn.user.jid;
    const botPart = meta.participants.find(p => p.id === botJid);
    
    if (botPart && (botPart.admin === 'admin' || botPart.admin === 'superadmin')) {
      console.log(`[DEEP-DEBUG] ✅ Bot ya es admin - cancelando solicitud`);
      delete global.adminRequests[groupId];
      
      await sendConfirmationMessage(conn, groupId);
      return;
    }
  } catch (error) {
    console.error(`[DEEP-DEBUG] ❌ Error verificando admin:`, error.message);
  }
  
  request.attempts++;
  console.log(`[DEEP-DEBUG] 📈 Incrementando intentos: ${request.attempts}/${request.maxAttempts}`);
  
  // Obtener admins del grupo
  let admins = [];
  try {
    const meta = await conn.groupMetadata(groupId);
    admins = meta.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);
    
    console.log(`[DEEP-DEBUG] 👑 Admins encontrados (${admins.length}):`, admins.map(a => a.split('@')[0]));
  } catch (error) {
    console.error(`[DEEP-DEBUG] ❌ Error obteniendo admins:`, error.message);
  }
  
  // Crear mensaje según el intento
  let messageText;
  let isUrgent = false;
  
  if (request.attempts === 1) {
    messageText = `🧟‍♂️ *¡Hola! Soy KelokeBot*\n\n` +
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
    messageText = `🚨 *¡ÚLTIMA OPORTUNIDAD!* 🚨\n\n` +
                 `🧟‍♂️ Este es mi último recordatorio.\n` +
                 `⚰️ Si no recibo permisos de admin en los próximos *20 minutos*, me saldré automáticamente.\n\n` +
                 `🩸 Por favor, otórguenme permisos de administrador.\n` +
                 `☠️ Tiempo límite: *20 minutos*`;
    isUrgent = true;
  } else {
    messageText = `⚠️ *Recordatorio ${request.attempts}/${request.maxAttempts}*\n\n` +
                 `🧟‍♂️ Sigo esperando permisos de administrador.\n` +
                 `🕷️ Sin estos permisos mi funcionalidad está limitada.\n\n` +
                 `⏰ Intentos restantes: *${request.maxAttempts - request.attempts}*\n` +
                 `🔄 Próximo recordatorio en 10 minutos`;
  }
  
  // Preparar mensaje final
  const urgentPrefix = isUrgent ? '🚨🚨🚨' : '⚠️';
  let finalMessage = `${urgentPrefix} *SOLICITUD DE PERMISOS* ${urgentPrefix}\n\n${messageText}`;
  
  if (admins.length > 0) {
    finalMessage += `\n\n👥 Admins: ${admins.map(a => `@${a.split('@')[0]}`).join(' ')}`;
  }
  
  console.log(`[DEEP-DEBUG] 📝 Mensaje preparado (${finalMessage.length} caracteres)`);
  console.log(`[DEEP-DEBUG] 📤 Iniciando envío...`);
  
  // ENVÍO CON MÚLTIPLES INTENTOS Y DEBUGGING PROFUNDO
  let sendAttempts = 0;
  const maxSendAttempts = 5;
  let messageSent = false;
  
  while (!messageSent && sendAttempts < maxSendAttempts) {
    sendAttempts++;
    console.log(`[DEEP-DEBUG] 📤 Intento de envío ${sendAttempts}/${maxSendAttempts}`);
    
    try {
      // Preparar objeto del mensaje
      const messageObj = {
        text: finalMessage
      };
      
      // Añadir menciones si hay admins
      if (admins.length > 0) {
        messageObj.mentions = admins;
        console.log(`[DEEP-DEBUG] 👑 Menciones añadidas:`, admins.length);
      }
      
      console.log(`[DEEP-DEBUG] 📋 Objeto mensaje:`, {
        textLength: messageObj.text.length,
        mentionsCount: messageObj.mentions?.length || 0
      });
      
      // ENVIAR MENSAJE
      console.log(`[DEEP-DEBUG] 🚀 Enviando mensaje a WhatsApp...`);
      const result = await conn.sendMessage(groupId, messageObj);
      
      console.log(`[DEEP-DEBUG] ✅ MENSAJE ENVIADO EXITOSAMENTE!`);
      console.log(`[DEEP-DEBUG] 📋 Resultado:`, result);
      
      messageSent = true;
      
    } catch (error) {
      console.error(`[DEEP-DEBUG] ❌ ERROR EN ENVÍO (intento ${sendAttempts}):`, error.message);
      console.error(`[DEEP-DEBUG] 📋 Stack trace:`, error.stack);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('rate-overlimit')) {
        console.log(`[DEEP-DEBUG] ⏰ Rate limit detectado - esperando 45 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 45000));
      } else if (error.message.includes('Forbidden')) {
        console.log(`[DEEP-DEBUG] 🚫 Bot bloqueado en el grupo - cancelando solicitud`);
        delete global.adminRequests[groupId];
        return;
      } else {
        console.log(`[DEEP-DEBUG] ⏰ Error desconocido - esperando 10 segundos...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }
  
  if (!messageSent) {
    console.error(`[DEEP-DEBUG] ❌ FALLO CRÍTICO: No se pudo enviar mensaje después de ${maxSendAttempts} intentos`);
    // No eliminar la solicitud, intentar de nuevo en el próximo ciclo
  }
  
  // Programar siguiente acción
  if (request.attempts === request.maxAttempts) {
    console.log(`[DEEP-DEBUG] ⏰ Último intento enviado - programando salida en 20 minutos`);
    setTimeout(async () => {
      await handleFinalWarning(conn, groupId);
    }, request.finalWarning);
  } else if (request.attempts < request.maxAttempts) {
    console.log(`[DEEP-DEBUG] ⏰ Programando siguiente intento en 10 minutos`);
    setTimeout(async () => {
      await executeAdminRequest(conn, groupId);
    }, request.interval);
  }
}

// FUNCIÓN PARA MENSAJE DE CONFIRMACIÓN
async function sendConfirmationMessage(conn, groupId) {
  console.log(`[DEEP-DEBUG] 📤 Enviando mensaje de confirmación...`);
  
  try {
    await conn.sendMessage(groupId, {
      text: '✅ *¡Perfecto!*\n\n🧟‍♂️ KelokeBot ya tiene permisos de administrador.\n🩸 Ahora puedo funcionar correctamente.\n⚰️ ¡Gracias por la confianza!'
    });
    console.log(`[DEEP-DEBUG] ✅ Mensaje de confirmación enviado`);
  } catch (error) {
    console.error(`[DEEP-DEBUG] ❌ Error enviando confirmación:`, error.message);
  }
}

// FUNCIÓN PARA MANEJO FINAL
async function handleFinalWarning(conn, groupId) {
  console.log(`[DEEP-DEBUG] ========== MANEJO FINAL ==========`);
  
  const request = global.adminRequests[groupId];
  if (!request) {
    console.log(`[DEEP-DEBUG] ❌ Solicitud ya no existe`);
    return;
  }
  
  try {
    // Verificar una última vez si es admin
    const meta = await conn.groupMetadata(groupId);
    const botJid = conn.user.jid;
    const botPart = meta.participants.find(p => p.id === botJid);
    
    if (botPart && (botPart.admin === 'admin' || botPart.admin === 'superadmin')) {
      console.log(`[DEEP-DEBUG] ✅ Bot se convirtió en admin en el último momento`);
      delete global.adminRequests[groupId];
      await sendConfirmationMessage(conn, groupId);
      return;
    }
    
    console.log(`[DEEP-DEBUG] 💀 Enviando mensaje de despedida...`);
    
    await conn.sendMessage(groupId, {
      text: `💀 *TIEMPO AGOTADO* 💀\n\n🧟‍♂️ No recibí permisos de administrador.\n⚰️ Me retiro del grupo.\n🩸 Si me quieren de vuelta, añádanme con permisos de admin.\n\n☠️ ¡Hasta la vista, mortales!`
    });
    
    console.log(`[DEEP-DEBUG] ✅ Mensaje de despedida enviado`);
    
    // Esperar y salir del grupo
    setTimeout(async () => {
      try {
        console.log(`[DEEP-DEBUG] 🚪 Saliendo del grupo...`);
        await conn.groupLeave(groupId);
        console.log(`[DEEP-DEBUG] ✅ Salida exitosa`);
      } catch (error) {
        console.error(`[DEEP-DEBUG] ❌ Error saliendo:`, error.message);
      }
      
      delete global.adminRequests[groupId];
    }, 5000);
    
  } catch (error) {
    console.error(`[DEEP-DEBUG] ❌ Error en handleFinalWarning:`, error.message);
    delete global.adminRequests[groupId];
  }
}

handler.before = true;

export default handler;
