import fetch from "node-fetch";
import axios from 'axios';
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  try {
    if (!text) {
      return conn.reply(m.chat, `🌾 *Ingresa un link de YouTube o el nombre del video*\n\n*Ejemplo:*\n${usedPrefix + command} https://youtu.be/abc123\n${usedPrefix + command} linkin park somewhere i belong`, m);
    }

    await m.react('⏱️');

    let videoInfo, urlYt;

    // Regex mejorado para detectar URLs de YouTube
    const isYoutubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\/.+$/.test(text);

    if (isYoutubeUrl) {
      // Extraer ID del video de diferentes formatos de URL
      const id = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^\s&?]+)/)?.[1];
      if (!id) {
        return conn.reply(m.chat, `⚠️ No se pudo extraer el ID del video de la URL proporcionada.`, m);
      }

      try {
        const result = await yts({ videoId: id });
        videoInfo = result;
        urlYt = text;
      } catch (error) {
        return conn.reply(m.chat, `⚠️ Error al obtener información del video. Verifica que la URL sea válida.`, m);
      }
    } else {
      // Buscar por nombre
      try {
        const search = await yts(text);
        if (!search?.videos?.length) {
          return conn.reply(m.chat, `⚠️ No se encontraron resultados para: *${text}*\n\nIntenta con otras palabras clave.`, m);
        }
        videoInfo = search.videos[0];
        urlYt = videoInfo.url;
      } catch (error) {
        return conn.reply(m.chat, `⚠️ Error al realizar la búsqueda: ${error.message}`, m);
      }
    }

    // Verificar que tenemos información del video
    if (!videoInfo) {
      return conn.reply(m.chat, `⚠️ No se pudo obtener información del video.`, m);
    }

    const {
      title = 'Sin título',
      timestamp = 'Desconocido',
      author = {},
      views = 0,
      ago = 'Desconocido',
      url = urlYt,
      thumbnail
    } = videoInfo;

    const canal = author?.name || 'Desconocido';
    const vistas = typeof views === 'number' ? views.toLocaleString('es-PE') : views;

    // API key corregida (sin espacios)
    const apiUrl = `https://api.stellarwa.xyz/dow/ytmp4?url=${encodeURIComponent(url)}&apikey=stellar-nzBMWh9P`;
    
    let data;
    try {
      const response = await axios.get(apiUrl, {
        timeout: 30000, // 30 segundos de timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      data = response.data;
    } catch (error) {
      console.error('Error en API:', error.message);
      return conn.reply(m.chat, `❌ Error al conectar con el servicio de descarga. Intenta nuevamente en unos minutos.`, m);
    }

    if (!data?.status || !data?.data?.dl) {
      console.error('Respuesta de API:', data);
      return conn.reply(m.chat, `❌ No se pudo obtener el enlace de descarga. El video podría estar restringido o la API no está disponible.`, m);
    }

    const videoUrl = data.data.dl;
    
    // Obtener tamaño del archivo
    const size = await getSize(videoUrl);
    const sizeStr = size ? await formatSize(size) : 'Desconocido';

    // Verificar si el archivo es muy grande (más de 100MB)
    if (size && size > 100 * 1024 * 1024) {
      return conn.reply(m.chat, `⚠️ El archivo es muy grande (${sizeStr}). Por favor, elige un video más pequeño.`, m);
    }

    const textoInfo =
      ` ⬣ *🎲  \`YOUTUBE - MP4\` 🇦🇱* ⬣\n\n` +
      `> 📌 *𝑻𝒊𝒕𝒖𝒍𝒐:* ${title}\n` +
      `> ⏱️ *𝑫𝒖𝒓𝒂𝒄𝒊𝒐𝒏:* ${timestamp}\n` +
      `> 🧑‍🏫 *𝑪𝒂𝒏𝒂𝒍:* ${canal}\n` +
      `> 👁️ *𝑽𝒊𝒔𝒕𝒂𝒔:* ${vistas}\n` +
      `> 🗓️ *𝑷𝒖𝒃𝒍𝒊𝒄𝒂𝒅𝒐:* ${ago}\n` +
      `> 💾 *𝑻𝒂𝒎𝒂𝒏̃𝒐:* ${sizeStr}\n` +
      `> 🔗 *𝑳𝒊𝒏𝒌:* ${url}\n\n` +
      ` *➭ 𝑬𝒍 𝒗𝒊𝒅𝒆𝒐 𝒔𝒆 𝒆𝒔𝒕𝒂 𝒆𝒏𝒗𝒊𝒂𝒏𝒅𝒐, 𝑬𝒔𝒑𝒆𝒓𝒆 𝒖𝒏 𝒎𝒐𝒎𝒆𝒏𝒕𝒊𝒕𝒐~ 🌸*`;

    // Enviar información del video con thumbnail
    try {
      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: textoInfo
      }, { quoted: m });
    } catch (error) {
      console.error('Error enviando imagen:', error);
      await conn.reply(m.chat, textoInfo, m);
    }

    // Descargar y enviar el video
    try {
      const videoResponse = await fetch(videoUrl, {
        timeout: 60000, // 60 segundos para la descarga
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!videoResponse.ok) {
        throw new Error(`HTTP ${videoResponse.status}: ${videoResponse.statusText}`);
      }

      const videoBuffer = await videoResponse.buffer();
      
      // Sanitizar el nombre del archivo
      const cleanTitle = title.replace(/[^\w\s-]/g, '').trim().substring(0, 50);
      const fileName = `${cleanTitle}.mp4`;

      await conn.sendFile(m.chat, videoBuffer, fileName, '\n🖍️ 𝑨𝒒𝒖𝒊 𝒕𝒊𝒆𝒏𝒆𝒔 𝒕𝒖 𝒗𝒊𝒅𝒆𝒐~ 🌸', m);

      await m.react('✅');

    } catch (downloadError) {
      console.error('Error descargando video:', downloadError);
      await conn.reply(m.chat, `❌ Error al descargar el video: ${downloadError.message}\n\nPuedes intentar con otro video o usar el enlace directo: ${videoUrl}`, m);
      await m.react('❌');
    }

  } catch (e) {
    console.error('Error general:', e);
    await conn.reply(m.chat, `❌ Error inesperado: ${e.message}\n\nIntenta nuevamente en unos minutos.`, m);
    await m.react('❌');
  }
};

handler.help = ['ytmp4 <link o nombre>'];
handler.tags = ['descargas'];
handler.command = ['ytmp4', 'ytvideo', 'ytv'];
handler.register = true;

export default handler;

// Función para formatear el tamaño en bytes
async function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  
  if (!bytes || isNaN(bytes) || bytes <= 0) return 'Desconocido';
  
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  
  return `${size.toFixed(2)} ${units[i]}`;
}

// Función para obtener el tamaño del archivo
async function getSize(url) {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const contentLength = response.headers['content-length'];
    return contentLength ? parseInt(contentLength, 10) : null;
  } catch (error) {
    console.error("Error al obtener el tamaño:", error.message);
    return null;
  }
}
