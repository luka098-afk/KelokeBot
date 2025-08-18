const handler = async (m, { conn, isAdmin, text }) => {
  // Verificar si el usuario es admin
  if (m.isGroup && !isAdmin) {
    return conn.reply(m.chat, `🔒 *Solo administradores pueden usar este comando*`, m);
  }

  // Solo funciona en grupos
  if (!m.isGroup) {
    return conn.reply(m.chat, `❌ *Este comando solo funciona en grupos*`, m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '📢', key: m.key } });

    // Obtener participantes del grupo
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(p => p.id);
    
    // Mensaje a mostrar (texto personalizado o por defecto)
    const mensaje = text || 'HOLAAAAAAAAA';

    // Enviar 5 menciones rápidas sin retraso
    for (let i = 1; i <= 5; i++) {
      await conn.sendMessage(m.chat, {
        text: `${mensaje}\n\n${participants.map(user => `@${user.split('@')[0]}`).join(' ')}`,
        mentions: participants
      });
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('❌ Error en tagall2:', error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return conn.reply(m.chat, `❌ *Error al mencionar usuarios*`, m);
  }
};

handler.command = ['tagall2'];
handler.tags = ['tools'];
handler.help = ['tagall2'];
handler.register = true;

export default handler;
