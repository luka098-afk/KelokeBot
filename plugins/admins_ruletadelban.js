case '.ruletaban': {
  if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.');
  if (!isBotAdmin) return m.reply('🤖 Necesito ser administrador para poder expulsar.');
  if (!isAdmin && !isOwner) return m.reply('⛔ Solo admins o el dueño pueden usar este comando.');

  let participantes = participants.filter(p => p.id !== botNumber && !p.admin); // Solo usuarios normales
  if (participantes.length < 1) return m.reply('❌ No hay suficientes participantes para jugar.');

  let perdedor = participantes[Math.floor(Math.random() * participantes.length)];
  let mencion = [perdedor.id];

  await conn.sendMessage(m.chat, {
    text: `🎯 *¡Ruleta Ban iniciada!* Girando...\n\n😱 *El perdedor es:* @${perdedor.id.split('@')[0]}\n\n💥 Será eliminado del grupo...`,
    mentions: mencion
  });

  await sleep(3000); // espera 3 segundos para dramatismo

  try {
    await conn.groupParticipantsUpdate(m.chat, [perdedor.id], 'remove');
  } catch (e) {
    await m.reply('❌ No pude eliminar al perdedor. ¿Tengo permisos suficientes?');
  }
  break;
}
