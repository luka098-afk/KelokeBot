let handler = async (m, { conn, isAdmin }) => {
  // Verificar si el usuario es administrador
  if (!isAdmin) {
    return await m.reply('❌ Este comando solo puede ser usado por administradores.');
  }

  const start = performance.now();
  // Enviar mensaje inicial
  const sentMessage = await m.reply('🏓 *Probando velocidad...*');
  const end = performance.now();
  const ping = end - start;

  // Editar el mensaje con el resultado
  await conn.sendMessage(m.chat, {
    text: `✅ *𝗞𝗲𝗹𝗼𝗸𝗲𝗕𝗼𝘁 está activo*\n📡 *Velocidad:* ${ping.toFixed(2)} ms`,
    edit: sentMessage.key
  });
};

handler.command = ['ping'];
handler.tags = ['info'];
handler.help = ['ping'];
handler.register = true;
handler.admin = true; // Restricción para administradores

export default handler;
