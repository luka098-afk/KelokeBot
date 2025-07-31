import ytdl from 'ytdl-core';

const handler = async (m, { conn, args, usedPrefix }) => {
  if (!args[0]) return m.reply(`✦ Ingresa el enlace de YouTube\nEjemplo: ${usedPrefix}video https://youtu.be/abc123`);

  const url = args[0];
  if (!ytdl.validateURL(url)) return m.reply('✦ URL inválida.');

  try {
    await m.react('🔄');

    // Descarga en calidad 18 (360p mp4, tamaño razonable)
    const stream = ytdl(url, { quality: '18' });

    // Acumular chunks para buffer
    let chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // Limitar tamaño a 50MB para WhatsApp
    if (buffer.length > 50 * 1024 * 1024) {
      return m.reply('✦ Video demasiado pesado para enviar por WhatsApp (máx 50MB).');
    }

    // Enviar video
    await conn.sendMessage(m.chat, {
      video: buffer,
      mimetype: 'video/mp4',
      caption: '🎬 Aquí tienes tu video',
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    console.error(e);
    await m.react('⚠️');
    m.reply('✦ Error al descargar o enviar el video.');
  }
};

handler.help = ['video <url>'];
handler.tags = ['downloader'];
handler.command = ['video'];

export default handler;
