import fetch from 'node-fetch'
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command, isBotAdmin }) => {
  // Verificar admin de forma simple
  if (m.isGroup && !isBotAdmin) {
    return conn.reply(m.chat, `🔒 *Necesito ser administrador del grupo para enviar música.*\n\n💡 *Solución:* Hazme administrador y vuelve a intentarlo.`, m)
  }

  try {
    if (!text) {
      return conn.reply(m.chat, `🎵 *Escribe el nombre de la canción*\n\nEjemplo: ${usedPrefix}${command} Linkin Park Points Of Authority `, m);
    }

    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    const search = await yts(text);
    const video = search.videos?.[0];
    if (!video) throw new Error('No se encontró ningún resultado');

    const { title, timestamp, url, author, thumbnail } = video;
    const canal = author?.name || 'Desconocido';

    const thumbnailBuffer = await (await fetch(thumbnail)).buffer();

    const textoInfo = `🎵 *${title}*\n\n⏱️ Duración: ${timestamp}\n📺 Canal: ${canal}\n\n_Descargando audio..._`;

    await conn.sendMessage(m.chat, {
      image: thumbnailBuffer,
      caption: textoInfo
    }, { quoted: m });

    // Usar solo APIs que sabemos que funcionan
    const apis = [
      {
        name: 'Dark Core API',
        url: `https://dark-core-api.vercel.app/api/download/YTMP3?key=api&url=${encodeURIComponent(url)}`,
        handler: (data) => data?.status && data?.download ? { title: data.title || title, url: data.download } : null
      },
      {
        name: 'YT-DLP API',
        url: `https://api.cobalt.tools/api/json`,
        handler: async (url) => {
          const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url, vCodec: 'h264', vQuality: '720', aFormat: 'mp3', isAudioOnly: true })
          });
          const data = await response.json();
          return data?.status === 'success' && data?.url ? { title: title, url: data.url } : null;
        }
      }
    ];

    let json = null;
    let downloadUrl = null;

    for (const api of apis) {
      try {
        console.log(`Probando ${api.name}...`);
        
        let result = null;
        if (typeof api.handler === 'function' && api.name === 'YT-DLP API') {
          result = await api.handler(url);
        } else {
          const res = await fetch(api.url, { timeout: 15000 });
          if (!res.ok) continue;
          
          const data = await res.json();
          result = api.handler(data);
        }
        
        if (result?.url) {
          json = { title: result.title };
          downloadUrl = result.url;
          console.log(`✅ ${api.name} funcionó correctamente`);
          break;
        }
      } catch (apiError) {
        console.log(`❌ Error con ${api.name}:`, apiError.message);
        continue;
      }
    }

    if (!downloadUrl) {
      throw new Error('El servicio de descarga está temporalmente fuera de línea. Intenta de nuevo en unos minutos.');
    }

    await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${json?.title || title}.mp3`
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error('❌ Error en play:', e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    return conn.reply(m.chat, `❌ *Error:* ${e.message}`, m);
  }
};

handler.command = ['play'];
handler.tags = ['descargas'];
handler.help = ['play *<canción>*'];
handler.register = true;

export default handler;
