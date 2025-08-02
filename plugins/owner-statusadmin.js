// Auto Admin Handler - Maneja solicitudes de admin automáticamente
import { setTimeout as sleep } from 'timers/promises';

// Almacenamiento en memoria para grupos sin admin
global.adminRequests = global.adminRequests || {};

// Evento cuando el bot es añadido a un grupo
let handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  // Solo ejecutar en grupos
  if (!m.isGroup) return;
  
  // Si ya es admin, no hacer nada
  if (isBotAdmin) return;
  
  const groupId = m.chat;
  
  // Si ya existe una solicitud activa para este grupo, no crear otra
  if (global.adminRequests[groupId]) return;
  
  // Inicializar contador para este grupo
  global.adminRequests[groupId] = {
    attempts: 0,
    maxAttempts: 5,
    interval: 10 * 60 * 1000, // 10 minutos en ms
    finalWarning: 20 * 60 * 1000, // 20 minutos en ms
    startTime: Date.now()
  };
  
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
  
  // Función para enviar mensaje silencioso a admins
  const sendAdminMessage = async (message, isUrgent = false) => {
    try {
      const admins = await getGroupAdmins();
      if (admins.length === 0) return;
      
      const mentions = admins;
      const urgentEmoji = isUrgent ? '🚨🚨🚨' : '⚠️';
      
      const fullMessage = `${urgentEmoji} *SOLICITUD DE PERMISOS* ${urgentEmoji}\n\n${message}\n\nAdmins: ${mentions.map(admin => `@${admin.split('@')[0]}`).join(' ')}`;
      
      await conn.sendMessage(groupId, {
        text: fullMessage,
        mentions: mentions
      });
    } catch (error) {
      console.error('Error enviando mensaje a admins:', error);
    }
  };
  
  // Función principal de solicitud
  const requestAdminLoop = async () => {
    const request = global.adminRequests[groupId];
    if (!request) return;
    
    // Verificar si ya es admin
    const groupMetadata = await conn.groupMetadata(groupId);
    const botParticipant = groupMetadata.participants.find(p => p.id === conn.user.jid);
    
    if (botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')) {
      // Ya es admin, limpiar solicitud
      delete global.adminRequests[groupId];
      
      await sendAdminMessage(`✅ *¡Perfecto!*\n\n🧟‍♂️ KelokeBot ya tiene permisos de administrador.\n🩸 Ahora puedo funcionar correctamente en este grupo.\n⚰️ ¡Gracias por la confianza!`);
      return;
    }
    
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
                 `🔄 Próximo recordatorio en 10 minutos`;
      } else if (request.attempts === request.maxAttempts) {
        // Último intento
        message = `🚨 *¡ÚLTIMA OPORTUNIDAD!* 🚨\n\n` +
                 `🧟‍♂️ Este es mi último recordatorio.\n` +
                 `⚰️ Si no recibo permisos de admin en los próximos *20 minutos*, me saldré automáticamente del grupo.\n\n` +
                 `🩸 Por favor, otórguenme permisos de administrador para continuar.\n` +
                 `☠️ Tiempo límite: *20 minutos*`;
        
        await sendAdminMessage(message, true);
        
        // Esperar 20 minutos y salir si no es admin
        setTimeout(async () => {
          const currentRequest = global.adminRequests[groupId];
          if (!currentRequest) return; // Ya fue resuelto
          
          // Verificar una última vez si es admin
          try {
            const groupMetadata = await conn.groupMetadata(groupId);
            const botParticipant = groupMetadata.participants.find(p => p.id === conn.user.jid);
            
            if (botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')) {
              delete global.adminRequests[groupId];
              return;
            }
            
            // No es admin, enviar mensaje de despedida y salir
            await conn.sendMessage(groupId, {
              text: `💀 *TIEMPO AGOTADO* 💀\n\n` +
                   `🧟‍♂️ Como no recibí permisos de administrador, me retiro del grupo.\n` +
                   `⚰️ Si me quieren de vuelta, agreguen con permisos de admin desde el inicio.\n` +
                   `🩸 ¡Hasta la vista, mortales!`
            });
            
            // Salir del grupo
            await sleep(3000);
            await conn.groupLeave(groupId);
            
            // Limpiar solicitud
            delete global.adminRequests[groupId];
            
          } catch (error) {
            console.error('Error en verificación final:', error);
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
        setTimeout(() => {
          requestAdminLoop();
        }, request.interval);
      }
    }
  };
  
  // Iniciar el proceso
  requestAdminLoop();
};

// Evento para detectar cuando se añade al bot a un grupo
handler.group_add = true;
handler.group_update = true;

export default handler;

// Comando adicional para verificar estado de admin en grupos actuales
let adminStatusHandler = async (m, { conn, isOwner }) => {
  if (!isOwner) return;
  
  let message = `🧟‍♂️ *ESTADO DE ADMIN EN GRUPOS*\n\n`;
  
  try {
    const groups = Object.keys(await conn.groupFetchAllParticipating());
    
    for (let groupId of groups) {
      try {
        const groupMetadata = await conn.groupMetadata(groupId);
        const botParticipant = groupMetadata.participants.find(p => p.id === conn.user.jid);
        const isAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
        
        const status = isAdmin ? '✅ Admin' : '❌ No Admin';
        const emoji = isAdmin ? '👑' : '👤';
        
        message += `${emoji} *${groupMetadata.subject}*\n`;
        message += `   └ Estado: ${status}\n`;
        message += `   └ Miembros: ${groupMetadata.participants.length}\n\n`;
        
      } catch (error) {
        message += `❌ *Error obteniendo info del grupo*\n\n`;
      }
    }
    
    // Mostrar solicitudes activas
    const activeRequests = Object.keys(global.adminRequests || {});
    if (activeRequests.length > 0) {
      message += `🔄 *SOLICITUDES ACTIVAS*\n\n`;
      for (let groupId of activeRequests) {
        const request = global.adminRequests[groupId];
        try {
          const groupMetadata = await conn.groupMetadata(groupId);
          message += `⏰ *${groupMetadata.subject}*\n`;
          message += `   └ Intentos: ${request.attempts}/${request.maxAttempts}\n\n`;
        } catch (error) {
          message += `❌ Grupo desconocido: ${request.attempts}/${request.maxAttempts}\n\n`;
        }
      }
    }
    
    await m.reply(message);
    
  } catch (error) {
    await m.reply('❌ Error obteniendo información de grupos');
  }
};

adminStatusHandler.command = ['adminstatus', 'estadoadmin'];
adminStatusHandler.tags = ['owner'];
adminStatusHandler.help = ['adminstatus'];
adminStatusHandler.owner = true;

export { adminStatusHandler };
