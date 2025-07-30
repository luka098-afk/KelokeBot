import fetch from 'node-fetch';

const handler = async (m, { args, conn, command, prefix }) => {
  if (!args[0]) {
    return m.reply(`📌 Ejemplo de uso:\n${(prefix || '.') + command} bad bunny - titi me pregunto`);
  }

  await conn.sendMessage(m.chat, {
    react: {
      text: '🎧',
      key: m.key,
    },
  });

  const query = encodeURIComponent(args.join(' '));
  const url = `https://itunes.apple.com/search?term=${query}&media=music`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.results || json.results.length === 0) {
      return m.reply('❌ No encontré la canción que estás buscando.');
    }

    const data = json.results[0];
    const caption = `🎵 *Título:* ${data.trackName}
🎤 *Artista:* ${data.artistName}
💿 *Álbum:* ${data.collectionName}
🌍 *Género:* ${data.primaryGenreName}

    // Enviar carátula + info
    await conn.sendMessage(m.chat, {
      image: { url: data.artworkUrl100.replace('100x100bb', '500x500bb') },
      caption,
    }, { quoted: m });

    // Enviar el preview de audio
    await conn.sendMessage(m.chat, {
      audio: { url: data.previewUrl },
      mimetype: 'audio/mpeg',
      ptt: false,
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key,
      },
    });

  } catch (e) {
    console.error(e);
    m.reply('⚠️ Ocurrió un error al buscar la canción.');
  }
};

handler.help = ['spotify <nombre de la canción>'];
handler.tags = ['busqueda'];
handler.command = ['spotify', 'sspotify', 'spotiti'];

export default handler;
