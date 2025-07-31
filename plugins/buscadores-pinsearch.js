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

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `⚰️ Ingresa un texto. Ejemplo: .pinterest gatos`, m);

  try {
    await m.react('🕸️');

    // Buscar nuevas imágenes
    const results = await pins(text);
    if (!results || results.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, `🎃 No se encontraron resultados para "${text}".`, m);
    }

    // Seleccionar imagen aleatoria para más variedad
    const randomIndex = Math.floor(Math.random() * results.length);
    await sendSingleImage(conn, m, results[randomIndex], text);
    await m.react('🦇');

  } catch (error) {
    console.error('Error en handler:', error);
    await m.react('💀');
    conn.reply(m.chat, '💀 Error al obtener imágenes de Pinterest.', m);
  }
};

const sendSingleImage = async (conn, m, imageData, searchTerm) => {
  try {
    const imageUrl = imageData.image_large_url || imageData.image_medium_url || imageData.image_small_url;
    
    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: `🕸️ *Resultado de Pinterest* 🕸️\n\n🎃 Búsqueda: ${searchTerm}\n⚰️ ¡Imagen encontrada con éxito!\n\n🦇 *Usa el comando nuevamente para más imágenes* 🦇`
    }, { quoted: m });
    
  } catch (error) {
    console.error('Error enviando imagen:', error);
    throw error;
  }
};

handler.help = ['pinterest'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];
handler.register = true;

export default handler;
