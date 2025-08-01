import fetch from "node-fetch";
import yts from 'yt-search';

const emoji = "🎵";
const rwait = "⏳";
const done = "✅";
const error = "❌";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return conn.reply(m.chat, `${emoji} *YouTube MP4 Downloader*\n\n📝 *Uso:* ${usedPrefix + command} <enlace o nombre>\n💡 *Ejemplo:* ${usedPrefix + command} despacito`, m);
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

    const res = await fetch(`https://api.stellarwa.xyz/api/download/ytmp4?url=${encodeURIComponent(urlYt)}`);
    if (!res.ok) throw new Error(`API error (${res.status})`);
    const json = await res.json();

    const downloadUrl = json?.result?.url;
    if (!downloadUrl || !downloadUrl.startsWith('http')) throw new Error('Enlace de descarga inválido');

    await conn.sendMessage(m.chat, {
      video: { url: downloadUrl },
      fileName: `${title.replace(/[^\w\s]/gi, '')}.mp4`,
      mimetype: "video/mp4",
      caption:
        `🎬 *${title}*\n` +
        `⏱️ *Duración:* ${timestamp}\n` +
        `👤 *Canal:* ${canal}\n` +
        `👁️ *Vistas:* ${vistas}\n` +
        `🗓️ *Publicado:* ${ago}\n` +
        `🔗 *Link:* ${urlYt}`,
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

    await m.react(done);

  } catch (e) {
    console.error('❌ Error general:', e);
    await m.react(error);

    let msg = "❌ *No se pudo descargar el video.*";
    if (e.message.includes('No se encontraron')) {
      msg = "🔍 *No se encontraron resultados.*";
    } else if (e.message.includes('timeout')) {
      msg = "⏰ *Tiempo agotado.*";
    } else if (e.message.includes('API')) {
      msg = "⚠️ *Error en la API.*";
    }
    m.reply(`${msg}\n\n*Detalles:* ${e.message}`);
  }
};

handler.help = ['ytmp4 <enlace o nombre>'];
handler.command = ['ytmp4'];
handler.tags = ['descargas'];
handler.limit = true;
handler.register = true;

export default handler;
