import fetch from 'node-fetch';
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`📽️ *Uso:* ${usedPrefix + command} <nombre o link de YouTube>`);
  }

  await m.react("⏳");

  let video, url;
  const isUrl = /(youtube\.com|youtu\.be)/i.test(text);

  if (isUrl) {
    url = text;
  } else {
    const search = await yts(text);
    if (!search?.videos?.length) {
      await m.react("❌");
      return m.reply("⚠️ No se encontraron resultados.");
    }
    video = search.videos[0];
    url = video.url;
  }

  try {
    const api = `https://api.stellarwa.xyz/dow/ytmp4?url=${encodeURIComponent(url)}`;
    const res = await fetch(api);
    const json = await res.json();

    if (!json?.url) throw new Error("No se obtuvo una URL de descarga válida.");

    const title = video?.title || json.title || "Video";
    const thumbnail = video?.thumbnail || null;
    const canal = video?.author?.name || "YouTube";

    // Mostrar solo una imagen con descripción
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption:
        `🎬 *${title}*\n📺 *Canal:* ${canal}\n\n⏳ *Descargando video...*`,
    }, { quoted: m });

    // Enviar el video descargado
    await conn.sendMessage(m.chat, {
      video: { url: json.url },
      fileName: `${title.replace(/[^\w\s]/gi, '')}.mp4`,
      mimetype: 'video/mp4',
      caption: `✅ *Video descargado correctamente*\n\n🎥 *${title}*\n🔗 ${url}`,
    }, { quoted: m });

    await m.react("✅");

  } catch (err) {
    console.error(err);
    await m.react("❌");
    m.reply(`❌ Ocurrió un error al descargar.\n\n🔍 Detalles:\n${err.message}`);
  }
};

handler.help = ['play2 <nombre o link>'];
handler.command = ['play2'];
handler.tags = ['descargas'];
handler.limit = true;

export default handler;
