// COMANDO: .status
let handler = async (m, { conn, isOwner }) => {
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
    
    await m.reply(message);
    
  } catch (error) {
    await m.reply(`❌ Error: ${error.message}`);
  }
};

handler.command = ['status', 'estado'];
handler.tags = ['owner'];
handler.help = ['status'];
handler.owner = true;

export default handler;
