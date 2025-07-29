const handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};
  
  // Solo claves que existen explícitamente y son booleanas
  const claves = Object.keys(chat).filter(k => typeof chat[k] === 'boolean' && k in chat);

  if (!claves.length) {
    return conn.reply(m.chat, '*⚠️ No hay configuraciones activadas en este grupo.*', m);
  }

  let texto = '╭━━🎛️ *CONFIGURACIÓN DEL GRUPO* ━━╮\n';
  for (const clave of claves) {
    texto += `┃ *${formatear(clave)}:* ${chat[clave] ? '✅ Activado' : '❌ Desactivado'}\n`;
  }
  texto += '╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯';

  await conn.reply(m.chat, texto, m);
};

function formatear(texto) {
  return texto
    .replace(/([A-Z])/g, ' $1') // separa camelCase en palabras
    .replace(/^./, s => s.toUpperCase()); // primera letra en mayúscula
}

handler.command = ['config'];
handler.tags = ['group'];
handler.help = ['config'];
handler.group = true;

export default handler;
