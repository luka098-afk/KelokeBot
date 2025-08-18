const handler = async (m, { conn, isAdmin }) => {
  // Verificar si el usuario es admin
  if (m.isGroup && !isAdmin) {
    return conn.reply(m.chat, `🔒 *Solo administradores pueden usar este comando*`, m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '📢', key: m.key } });

    let targetUser = null;

    // Determinar el usuario objetivo
    if (m.quoted) {
      // Si se citó un mensaje
      targetUser = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      // Si se mencionó a alguien
      targetUser = m.mentionedJid[0];
    } else {
      return conn.reply(m.chat, `❌ *Menciona a alguien o cita su mensaje*`, m);
    }

    // Enviar 5 etiquetas individuales con pausa
    for (let i = 1; i <= 5; i++) {
      await conn.sendMessage(m.chat, {
        text: `@${targetUser.split('@')[0]}`,
        mentions: [targetUser]
      });
      
      // Pausa de 1 segundo entre etiquetas para evitar spam
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('❌ Error en llamar:', error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return conn.reply(m.chat, `❌ *Error al llamar usuario*`, m);
  }
};

handler.command = ['llamar'];
handler.tags = ['tools'];
handler.help = ['llamar'];
handler.register = true;

export default handler;
