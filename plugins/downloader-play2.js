import fetch from "node-fetch";
import yts from 'yt-search';

const emoji = "🎵";
const rwait = "⏳";
const done = "✅";
const error = "❌";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return conn.reply(m.chat, `${emoji} *YouTube Downloader*\n\n📝 *Uso:* ${usedPrefix + command} <link o nombre>\n💡 *Ejemplo:* ${usedPrefix + command} despacito`, m);
    }

    await m.react(rwait);

    let videoInfo, urlYt;
    const isYoutubeUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(text);

    if (isYoutubeUrl) {
      const id = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^\s&]+)/)?.[1];
      if (!id) {
        await m.react(error);
        return m.reply(`⚠️ No se pudo extraer el ID del video.`);
      }
      const result = await yts({ videoId: id });
      videoInfo = result;
      urlYt = text;
    } else {
      const search = await yts(text);
      if (!search?.videos?.length) {
        await m.react(error);
        return conn.reply(m.chat, `⚠️ No se encontraron resultados para: *${text}*`, m);
      }
      videoInfo = search.videos[0];
      urlYt = videoInfo.url;
    }

    const { title, timestamp, author = {}, views, ago, thumbnail } = videoInfo;
    const canal = author.name || 'Desconocido';
    const vistas = views.toLocaleString('es-ES');

    const textoInfo =
      `🎬 *${title}*\n` +
      `⏱️ *Duración:* ${timestamp}\n` +
      `👤 *Canal:* ${canal}\n` +
      `👁️ *Vistas:* ${vistas}\n` +
      `🗓️ *Publicado:* ${ago}\n` +
      `🔗 *Link:* ${urlYt}\n\n` +
      `⬇️ *Descargando video...*`;

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: textoInfo,
      contextInfo: {
        externalAdReply: {
          title: 'YouTube Downloader',
          body: `Descargando: ${title}`,
          thumbnailUrl: thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: urlYt
        }
      }
    }, { quoted: m });

    // APIs de descarga
    const sources = [
      {
        name: 'StellarWA API',
        url: `https://api.stellarwa.xyz/api/download/ytmp4?url=${encodeURIComponent(urlYt)}`,
        path: ['result', 'url']
      },
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
        const res = await fetch(source.url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const json = await res.json();

        let downloadUrl = source.path.reduce((o, k) => o?.[k], json) ||
                          json?.data?.dl ||
                          json?.result?.download?.url ||
                          json?.downloads?.url ||
                          json?.data?.download?.url ||
                          json?.download ||
                          json?.url;

        if (downloadUrl && typeof downloadUrl === 'string' && downloadUrl.startsWith('http')) {
          await conn.sendMessage(m.chat, {
            video: { url: downloadUrl },
            fileName: `${title.replace(/[^\w\s]/gi, '')}.mp4`,
            mimetype: "video/mp4",
            caption: `🎬 *${title}*\n👤 *${canal}*\n\n✅ *Video descargado.*`,
            contextInfo: {
              externalAdReply: {
                title,
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
          throw new Error(`URL de descarga no válida`);
        }
      } catch (err) {
        console.warn(`❌ Error con ${source.name}: ${err.message}`);
        lastError = err;
      }
    }

    if (!success) {
      await m.react(error);
      throw new Error(`Todas las fuentes de descarga fallaron. Último error: ${lastError?.message}`);
    }

    await m.react(done);

  } catch (e) {
    console.error('❌ Error general:', e);
    await m.react(error);

    let msg = "❌ *Error al descargar el video.*";
    if (e.message.includes('No se encontraron')) {
      msg = "🔍 *No se encontraron videos con ese nombre.*";
    } else if (e.message.includes('timeout')) {
      msg = "⏰ *Tiempo de espera agotado. Intenta con otro video.*";
    }
    m.reply(`${msg}\n\n*Detalles:* ${e.message}`);
  }
};

handler.help = ['play2 <link o nombre>'];
handler.command = ['play2'];
handler.tags = ['descargas'];
handler.limit = true;
handler.register = true;

export default handler;
