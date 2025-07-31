import axios from 'axios';

const pins = async (judul) => {
  try {
    const res = await axios.get(`https://anime-xi-wheat.vercel.app/api/pinterest?q=${encodeURIComponent(judul)}`);
    if (Array.isArray(res.data.images)) {
      return res.data.images.map(url => ({
        image_large_url: url,
        image_medium_url: url,
        image_small_url: url
      }));
    }
    return [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// Almacenar resultados por chat para poder cargar más imágenes
const chatResults = new Map();

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `⚰️ Ingresa un texto. Ejemplo: .pinterest ${botname}`, m, fake);

  try {
    m.react('🕸️');
    
    // Buscar nuevas imágenes
    const results = await pins(text);
    if (!results || results.length === 0) {
      return conn.reply(m.chat, `🎃 No se encontraron resultados para "${text}".`, m, fake);
    }

    // Guardar resultados y reiniciar índice
    chatResults.set(m.chat, {
      images: results,
      currentIndex: 0,
      searchTerm: text
    });

    await sendSingleImageWithButton(conn, m, results[0], text, 0, results.length);
    await conn.sendMessage(m.chat, { react: { text: '🦇', key: m.key } });

  } catch (error) {
    conn.reply(m.chat, '💀 Error al obtener imágenes de Pinterest.', m, fake);
  }
};

const sendSingleImageWithButton = async (conn, m, imageData, searchTerm, currentIndex, totalImages) => {
  const buttons = [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: '🕷️ NUEVA IMAGEN',
        id: `nextpinterest_${m.chat}_${searchTerm}`
      })
    }
  ];

  const imageMessage = {
    image: { url: imageData.image_large_url || imageData.image_medium_url || imageData.image_small_url },
    caption: `⚱️ Resultado de: ${searchTerm}\n🕯️ Imagen ${currentIndex + 1} de ${totalImages}\n💀 Creador: ${dev}`,
    footer: '🎃 Presiona el botón para ver otra imagen',
    buttons: buttons,
    headerType: 4
  };

  await conn.sendMessage(m.chat, imageMessage, { quoted: m });
};

// Handler para el botón de nueva imagen
const handleNextImage = async (m, { conn }) => {
  const chatId = m.chat;
  const chatData = chatResults.get(chatId);
  
  if (!chatData) {
    return conn.reply(m.chat, '🦴 No hay búsqueda activa. Usa .pinterest [término] primero.', m, fake);
  }

  try {
    m.react('⚰️');
    
    // Avanzar al siguiente índice
    chatData.currentIndex = (chatData.currentIndex + 1) % chatData.images.length;
    
    const nextImage = chatData.images[chatData.currentIndex];
    await sendSingleImageWithButton(conn, m, nextImage, chatData.searchTerm, chatData.currentIndex, chatData.images.length);
    
    await conn.sendMessage(m.chat, { react: { text: '🕸️', key: m.key } });
    
  } catch (error) {
    conn.reply(m.chat, '💀 Error al cargar la siguiente imagen.', m, fake);
  }
};

// Agregar handler para los botones
conn.ev.on('messages.upsert', async ({ messages }) => {
  const m = messages[0];
  if (!m.message) return;
  
  const messageType = Object.keys(m.message)[0];
  if (messageType === 'interactiveResponseMessage') {
    const response = m.message.interactiveResponseMessage;
    const buttonId = response.nativeFlowResponseMessage?.paramsJson || 
                    response.legacyContextMessage?.selectMessage?.selectedId ||
                    '';
    
    if (buttonId.startsWith('nextpinterest_')) {
      await handleNextImage(m, { conn });
    }
  }
});

handler.help = ['pinterest'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];
handler.register = true;

export default handler;
