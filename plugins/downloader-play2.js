import fetch from "node-fetch";
import axios from 'axios';
import yts from 'yt-search';

const handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return conn.reply(m.chat, `📥 Ingresa un link o nombre de YouTube.`, m);
    }

    m.react('⏱️');

    let videoInfo, urlYt;

    const isYoutubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(text);

    if (isYoutubeUrl) {
      const id = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^\s&]+)/)?.[1];
      if (!id) return m.reply(`⚠️ No se pudo extraer el ID del video.`);
      const result = await yts({ videoId: id });
      videoInfo = result;
      urlYt = text;
    } else {
      const search = await yts(text);
      if (!search?.videos?.length) {
        return conn.reply(m.chat, `⚠️ No se encontraron resultados para: *${text}*`, m);
      }
      videoInfo = search.videos[0];
      urlYt = videoInfo.url;
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

    const canal = author.name || 'Desconocido';
    const vistas = views.toLocaleString('es-PE');

    // PETICIÓN A STELLARWA
    const { data } = await axios.get(`https://api.stellarwa.xyz/dow/ytmp4?url=${encodeURIComponent(url)}`, {
      headers: {
        'Authorization': 'stellar-nzBMWh9P'
      }
    });

    if (!data?.status || !data?.data?.dl) {
      throw new Error("No se pudo obtener el enlace de descarga.");
    }

    const videoUrl = data.data.dl;
    const size = await getSize(videoUrl);
    const sizeStr = size ? await formatSize(size) : 'Desconocido';

    const textoInfo =
      `🎬 *YOUTUBE - MP4*\n\n` +
      `📌 *Título:* ${title}\n` +
      `⏱️ *Duración:* ${timestamp}\n` +
      `👤 *Canal:* ${canal}\n` +
      `👁️ *Vistas:* ${vistas}\n` +
      `🗓️ *Publicado:* ${ago}\n` +
      `💾 *Tamaño:* ${sizeStr}\n` +
      `🔗 *Link:* ${url}`;

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: textoInfo
    }, { quoted: m });

    const videoBuffer = await fetch(videoUrl).then(res => res.buffer());
    await conn.sendFile(m.chat, videoBuffer, `${title}.mp4`, '', m);

    m.react('✅');

  } catch (e) {
    console.error(e);
    m.reply(`❌ Error:\n${e.message}`);
  }
};

handler.help = ['ytmp4 <link o nombre>'];
handler.command = ['ytmp4'];
handler.tags = ['descargas'];

export default handler;

// Funciones auxiliares
async function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  if (!bytes || isNaN(bytes)) return 'Desconocido';
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

async function getSize(url) {
  try {
    const response = await axios.head(url);
    return response.headers['content-length']
      ? parseInt(response.headers['content-length'], 10)
      : null;
  } catch (error) {
    console.error("Error al obtener el tamaño:", error.message);
    return null;
  }
}
