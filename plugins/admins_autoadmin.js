const handler = async (m, { conn, isAdmin, groupMetadata }) => {
  const done = '✅'; // Flecha verde o check, puedes cambiar por otra emoji si quieres
  const emoji = '⚠️'; // Para mensajes de aviso o error
  const msm = '❌';    // Para mensaje de error

  if (isAdmin) return m.reply(`${emoji} Tu ya eres admin.`);
  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
    await m.react(done);  // Reacciona con emoji
    // No se envía mensaje de texto después de promover
  } catch {
    m.reply(`${msm} Ocurrio un error.`);
  }
};
handler.tags = ['owner'];
handler.help = ['autoadmin'];
handler.command = ['autoadmin'];
handler.rowner = true;
handler.group = true;
handler.botAdmin = false;

export default handler;
