let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`*📝 Escribe un texto para chatear con KelokeBot!*\n*Ejemplo:* .${command} Hola, ¿cómo estás?`);
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

// Todos los comandos posibles con combinaciones de letras (bot, Bot, BOT, etc.)
const botVariants = [
  'bot', 'Bot', 'BOT', 'bOt', 'boT', 'BoT', 'bOT', 'BoT', 'bOt', 'BOt'
];

handler.help = ['bot'];
handler.tags = ['ai'];
handler.command = [...botVariants, 'keloke', 'kelokeai', 'iakeloke'];
handler.limit = true;
handler.register = true;

export default handler;
