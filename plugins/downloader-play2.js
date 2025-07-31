import fetch from "node-fetch";
import axios from 'axios';
import yts from 'yt-search';

// Definir emojis y variables para RoxyBot
const emoji = "🎵";
const rwait = "⏳";
const done = "✅";
const error = "❌";

// Variables globales de RoxyBot
const getBotInfo = () => ({
  packname: global.packname || global.packsticker || '🤖 RoxyBot',
  author: global.packsticker2 || global.author || 'RoxyBot',
  redes: global.redes || '',
  icons: global.icons || null
});

const handler = async (m, { conn, text, usedPrefix, command, args }) => {
  try {
    if (!text) {
      return conn.reply(m.chat, `${emoji} *RoxyBot YouTube Downloader*\n\n📝 *Uso:* ${usedPrefix + command} <link o nombre>\n💡 *Ejemplo:* ${usedPrefix + command} despacito`, m);
    }

    // Reaccionar con emoji de espera
    await m.react(rwait);

    let videoInfo, urlYt;
    const isYoutubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(text);

    console.log(`🔍 Buscando: "${text}" (es URL: ${isYoutubeUrl})`);

    if (isYoutubeUrl) {
      const id = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^\s&]+)/)?.[1];
      if (!id) {
        await m.react(error);
        return m.reply(`⚠️ No se pudo extraer el ID del video de YouTube.`);
      }

      console.log(`📹 Obteniendo info del video ID: ${id}`);
      try {
        const result = await yts({ videoId: id });
        videoInfo = result;
        urlYt = text;
      } catch (searchError) {
        console.error('Error buscando por ID:', searchError.message);
        throw new Error('No se pudo obtener información del video');
      }
    } else {
      console.log(`🔎 Buscando videos de: "${text}"`);
      try {
        const search = await yts(text);
        if (!search?.videos?.length) {
          await m.react(error);
          return conn.reply(m.chat, `⚠️ No se encontraron resultados para: *${text}*\n\n💡 *Intenta con:*\n• Palabras más específicas\n• El nombre exacto del video\n• Un enlace directo de YouTube`, m);
        }
        videoInfo = search.videos[0];
        urlYt = videoInfo.url;
      } catch (searchError) {
        console.error('Error en búsqueda:', searchError.message);
        throw new Error('Error al buscar en YouTube');
      }
    }

    const {
      title = 'Sin título',
      timestamp = 'Desconocido',
      author = {},
      views = 0,
      ago = 'Desconocido',
      thumbnail
    } = videoInfo;

    const canal = author.name || 'Desconocido';
    const vistas = views.toLocaleString('es-ES');

    console.log(`📺 Video encontrado: "${title}" por ${canal}`);

    const textoInfo = 
      `🤖 *RoxyBot - YouTube Downloader* 🎵\n\n` +
      `📌 *Título:* ${title}\n` +
      `⏱️ *Duración:* ${timestamp}\n` +
      `👤 *Canal:* ${canal}\n` +
      `👁️ *Vistas:* ${vistas}\n` +
      `🗓️ *Publicado:* ${ago}\n` +
      `🔗 *Link:* ${urlYt}\n\n` +
      `⬇️ *Descargando video, espera un momento...* 🤖`;

    // Enviar info del video
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: textoInfo,
      contextInfo: {
        externalAdReply: {
          title: 'RoxyBot YouTube Downloader',
          body: `🤖 Descargando: ${title}`,
          thumbnailUrl: thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: urlYt
        }
      }
    }, { quoted: m });

    // APIs de descarga con mejor orden de prioridad
    const sources = [
      {
        name: 'SiputZX API',
        url: `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(urlYt)}`,
        path: ['data', 'dl']
      },
      {
        name: 'Zenkey API', 
        url: `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${encodeURIComponent(urlYt)}`,
        path: ['result', 'download', 'url']
      },
      {
        name: 'Axeel API',
        url: `https://axeel.my.id/api/download/video?url=${encodeURIComponent(urlYt)}`,
        path: ['downloads', 'url']
      },
      {
        name: 'Delirius API',
        url: `https://delirius-apiofc.vercel.app/download/ytmp4?url=${encodeURIComponent(urlYt)}`,
        path: ['data', 'download', 'url']
      }
    ];

    let success = false;
    let lastError = null;

    for (let source of sources) {
      try {
        console.log(`🔄 Intentando con ${source.name}...`);
        
        const res = await fetch(source.url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        console.log(`📄 Respuesta de ${source.name}:`, JSON.stringify(json).substring(0, 200));

        // Buscar URL de descarga usando diferentes rutas
        let downloadUrl = null;
        
        // Intentar con la ruta específica de la API
        if (source.path) {
          downloadUrl = source.path.reduce((obj, key) => obj?.[key], json);
        }
        
        // Fallbacks comunes
        if (!downloadUrl) {
          downloadUrl = json?.data?.dl || 
                       json?.result?.download?.url || 
                       json?.downloads?.url || 
                       json?.data?.download?.url ||
                       json?.download ||
                       json?.url;
        }

        if (downloadUrl && typeof downloadUrl === 'string' && downloadUrl.startsWith('http')) {
          console.log(`✅ URL de descarga obtenida de ${source.name}`);
          
          // Enviar el video
          await conn.sendMessage(m.chat, {
            video: { url: downloadUrl },
            fileName: `${title.replace(/[^\w\s]/gi, '')}.mp4`,
            mimetype: "video/mp4",
            caption: `🤖 *RoxyBot* - Video descargado\n\n📺 *${title}*\n👤 *${canal}*\n\n🎵 *¡Disfruta tu video!* 🤖`,
            contextInfo: {
              externalAdReply: {
                title: title,
                body: `Por: ${canal}`,
                thumbnailUrl: thumbnail,
                mediaType: 2,
                sourceUrl: urlYt
              }
            }
          }, { quoted: m });

          success = true;
          break;
        } else {
          throw new Error(`URL de descarga no válida: ${downloadUrl}`);
        }

      } catch (err) {
        console.warn(`❌ Error con ${source.name}: ${err.message}`);
        lastError = err;
        continue;
      }
    }

    if (!success) {
      await m.react(error);
      throw new Error(`⚠️ Todas las fuentes de descarga fallaron.\n*Último error:* ${lastError?.message || 'Desconocido'}`);
    }

    await m.react(done);

  } catch (e) {
    console.error('❌ Error general:', e);
    await m.react(error);
    
    let errorMsg = "❌ *Error inesperado al descargar el video*";
    
    if (e.message.includes('No se encontraron resultados')) {
      errorMsg = "🔍 *No se encontraron videos*\n\n💡 Intenta con palabras más específicas o un enlace directo.";
    } else if (e.message.includes('timeout')) {
      errorMsg = "⏰ *Tiempo de espera agotado*\n\n💡 El video podría ser muy largo o el servidor está lento.";
    } else if (e.message.includes('fuentes de descarga fallaron')) {
      errorMsg = "🔧 *Error en servidores de descarga*\n\n💡 Intenta de nuevo en unos minutos o con otro video.";
    }
    
    m.reply(`${errorMsg}\n\n*Detalles técnicos:* ${e.message}`);
  }
};

handler.help = ['ytmp4 <link o nombre>']
handler.command = ['ytmp4', 'ytvideo', 'youtube']
handler.tags = ['descargas']
handler.limit = true
handler.register = true

export default handler
