import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix }) => {
  if (!args[0]) return m.reply(`✦ Ingresa el nombre del artista o canción\nEjemplo: ${usedPrefix}video @artista`);

  const query = args.join(' ');
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  
  // Realizar búsqueda en YouTube
  const res = await fetch(searchUrl);
  const html = await res.text();
  const videoIdMatch = html.match(/"videoId":"([^"]+)"/);
  
  if (!videoIdMatch) return m.reply('✦ No se encontraron resultados.');

  const videoId = videoIdMatch[1];
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Obtener información del video
  const infoRes = await fetch(`https://youtube-download-api.matheusishiyama.repl.co/info/?url=${encodeURIComponent(videoUrl)}`);
  const info = await infoRes.json();
  
  if (!info.title) return m.reply('✦ No se pudo obtener información del video.');

  // Descargar video en MP4
  const videoRes = await fetch(`https://youtube-download-api.matheusishiyama.repl.co/mp4/?url=${encodeURIComponent(videoUrl)}`);
  
  if (!videoRes.ok) return m.reply('✦ Error al descargar el video.');

  const videoBuffer = await videoRes.buffer();

  // Enviar video
  await conn.sendMessage(m.chat, {
    video: videoBuffer,
    mimetype: 'video/mp4',
    caption: `🎬 ${info.title}`,
  }, { quoted: m });
};

handler.help = ['video <artista>'];
handler.tags = ['downloader'];
handler.command = ['video'];

export default handler;
