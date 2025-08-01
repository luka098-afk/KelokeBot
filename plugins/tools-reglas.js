let handler = async (m, { conn, participants }) => {
  if (!m.isGroup) {
    return m.reply('❌ Este comando solo funciona en grupos.');
  }

  try {
    let groupMeta = await conn.groupMetadata(m.chat);
    let desc = groupMeta.desc;

    if (!desc) {
      return m.reply('📜 *Reglas del grupo:*\nEste grupo no tiene una descripción configurada.');
    }

    return m.reply(`📜 *Reglas del grupo:*\n${desc}`);
  } catch (e) {
    console.error(e);
    return m.reply('❌ No se pudo obtener la descripción del grupo.');
  }
};

handler.command = /^reglas$/i;
handler.group = true;

export default handler;
