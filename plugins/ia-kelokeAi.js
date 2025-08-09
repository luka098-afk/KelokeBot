import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply(`*📝 Escribe un texto para chatear con KelokeBot!*\n*Ejemplo:* .${command} Hola, ¿cómo estás?`);
  }

  let waitMsg;
  try {
    // Enviar mensaje de espera
    waitMsg = await conn.sendMessage(m.chat, {
      text: '🤖 *KelokeBot está escribiendo...*'
    }, { quoted: m });

    // Agregar instrucción para que responda en español
    const spanishPrompt = `Responde en español: ${text}`;
    const apiUrl = `https://api.nekorinn.my.id/ai/ripleai?text=${encodeURIComponent(spanishPrompt)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`El bot no pudo procesar tu solicitud (Código: ${response.status})`);

    const data = await response.json();
    if (!data?.status || !data?.result) throw new Error('El bot no respondió correctamente');

    // Editar el mensaje de espera con la respuesta
    await conn.sendMessage(m.chat, {
      text: `💬 *KelokeBot respondió:*\n\n${data.result}`,
      edit: waitMsg.key
    });

  } catch (e) {
    console.error('Error en KelokeBot:', e);
    
    // Si hay mensaje de espera, editarlo con el error
    if (waitMsg) {
      await conn.sendMessage(m.chat, {
        text: `*❌ Error al conectar con KelokeBot:* ${e.message}`,
        edit: waitMsg.key
      });
    } else {
      m.reply(`*❌ Error al conectar with KelokeBot:* ${e.message}`);
    }
  }
};

// Todos los comandos posibles con combinaciones de letras (bot, Bot, BOT, etc.)
const botVariants = [
  'bot', 'Bot', 'BOT', 'bOt', 'boT', 'BoT', 'bOT', 'BOt'
];

handler.help = ['bot'];
handler.tags = ['ai'];
handler.command = [...botVariants, 'keloke', 'kelokeai', 'iakeloke'];
handler.limit = true;
handler.register = true;

export default handler;
