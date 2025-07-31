import yts from 'yt-search';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return conn.reply(m.chat, `*❗ Ingresa un título para buscar en YouTube.*\n✧ \`Ejemplo:\` ${usedPrefix}${command} Joji - Ew`, m);

  await m.react('🎲');

  try {
    let query = args.join(" ");
    let searchResults = await searchVideos(query);
    let spotifyResults = await searchSpotify(query);
    let AppleMusicResult = await (await fetch(`https://api.siputzx.my.id/api/s/applemusic?query=${query}&region=es`)).json();

    if (!searchResults.length && !spotifyResults.length) throw new Error('*✖️ No se encontraron resultados.*');

    let video = searchResults[0];

    let thumbnail;
    try {
      thumbnail = await (await fetch(video.miniatura)).buffer();
    } catch {
      thumbnail = await (await fetch('https://telegra.ph/file/36f2a1bd2aaf902e4d1ff.jpg')).buffer();
    }

    const caption = `*🌳  YOUTUBE PLAY 🎬*

*✧ titulo:* ${video.titulo || 'no encontrado'}
*✧ duracion:* ${video.duracion || 'no encontrado'}
*✧ publicado:* ${video.publicado || 'no encontrado'}
*✧ canal:* ${video.canal || 'no encontrado'}
*✧ vistas:* ${video.vistas || 'no encontrado'}
*✧ url:* ${video.url}`;

    const buttons = [
      { buttonId: `${usedPrefix}ytmp3 ${video.url}`, buttonText: { displayText: '🎧 MP3' }, type: 1 },
      { buttonId: `${usedPrefix}ytmp4 ${video.url}`, buttonText: { displayText: '🎥 MP4' }, type: 1 },
      { buttonId: `${usedPrefix}music ${spotifyResults[0]?.url || ''}`, buttonText: { displayText: '🎲 Spotify' }, type: 1 },
    ];

    await conn.sendMessage(m.chat, {
      image: thumbnail,
      caption: caption,
      buttons,
      footer: '🎶 Proyecto G - Multibuscador',
      headerType: 4
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    console.error(e);
    await m.react('✖️');
    conn.reply(m.chat, '*`Error al buscar el video.`*', m);
  }
};

handler.help = ['play8 *<texto>*'];
handler.tags = ['downloader'];
handler.command = ['play8'];
export default handler;

async function searchVideos(query) {
  try {
    const res = await yts(query);
    return res.videos.slice(0, 10).map(video => ({
      titulo: video.title,
      url: video.url,
      miniatura: video.thumbnail,
      canal: video.author.name,
      publicado: video.timestamp || 'No disponible',
      vistas: video.views || 'No disponible',
      duracion: video.duration?.timestamp || 'No disponible'
    }));
  } catch (error) {
    console.error('Error en yt-search:', error.message);
    return [];
  }
}

async function searchSpotify(query) {
  try {
    const res = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.data.slice(0, 10).map(track => ({
      titulo: track.title,
      url: track.url,
      duracion: track.duration || 'No disponible'
    }));
  } catch (error) {
    console.error('Error en Spotify API:', error.message);
    return [];
  }
}
