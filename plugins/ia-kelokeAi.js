let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply('*📝 Escribe un texto para chatear con KelokeBot!*\n*Ejemplo:* .keloke Hola, ¿cómo estás?');
  }

  try {
    await conn.reply(m.chat, '🤖 *KelokeBot está escribiendo...*', m);

    const apiUrl = `https://api.nekorinn.my.id/ai/ripleai?text=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`*❌ El bot no pudo procesar tu solicitud* (Código: ${response.status})`);

    const data = await response.json();
    if (!data?.status || !data?.result) throw new Error('*❌ El bot no respondió correctamente*');

    await conn.reply(m.chat, `💬 *KelokeBot respondió:*\n${data.result}\n\n📨 *Tu mensaje:* ${text}`, m);

  } catch (e) {
    console.error(e);
    m.reply('*❌ Error al conectar con KelokeBot: ' + e.message + '*');
  }
};

handler.help = ['keloke'];
handler.command = ['keloke', 'kelokeai', 'iakeloke'];
handler.tags = ['ai'];
handler.limit = true;
handler.register = true;

export default handler;
