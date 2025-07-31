import yts from 'yt-search';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return conn.reply(m.chat, `*❗ Ingresa un título para buscar en YouTube.*\n✧ \`Ejemplo:\` ${usedPrefix}${command} Joji - Ew`, m);

  await m.react('🔍');

  try {
    const query = args.join(" ");
    const res = await yts(query);
    const video = res.videos[0];

    if (!video) throw 'No se encontró el video.';

    const thumbnail = await (await fetch(video.thumbnail)).buffer();

    const caption = `*🎧 Título:* ${video.title}
*⏳ Duración:* ${video.timestamp}
*📺 Canal:* ${video.author.name}
*🔗 URL:* ${video.url}`;

    const buttons = [
      { buttonId: `${usedPrefix}ytmp3 ${video.url}`, buttonText: { displayText: '🎧 MP3' }, type: 1 },
      { buttonId: `${usedPrefix}ytmp4 ${video.url}`, buttonText: { displayText: '🎥 MP4' }, type: 1 }
    ];

    await conn.sendMessage(m.chat, {
      image: thumbnail,
      caption,
      footer: '🔊 Proyecto G - Descargas YouTube',
      buttons
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    console.error(e);
    await m.react('⚠️');
    conn.reply(m.chat, '*❌ Ocurrió un error al buscar o enviar el video.*', m);
  }
};

handler.help = ['play8 *<texto>*'];
handler.tags = ['downloader'];
handler.command = ['play8'];
export default handler;
