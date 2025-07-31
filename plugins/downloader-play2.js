import yts from 'yt-search';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix }) => {
  if (!args.length) return m.reply(`✦ Usa: ${usedPrefix}play8 <texto>`);
  
  const isDownload = ['.play8-mp3', '.play8-mp4'].includes(m.text.split(' ')[0]);
  if (isDownload) {
    // Parte para descarga y envío (tras pulsar botón)
    let [cmd, ...urlParts] = m.text.split(' ');
    let url = urlParts[0];
    if (!url) return m.reply('✦ URL faltante para descarga.');

    await m.react('🔄');

    try {
      // Cambia acá la API según formato
      if (cmd === '.play8-mp3') {
        // Descargar mp3 vía API
        const apiRes = await fetch(`https://api.danielrrapi.repl.co/api/ytmp3?url=${encodeURIComponent(url)}`);
        const json = await apiRes.json();
        if (!json || !json.result || !json.result.url) throw 'No se pudo obtener el audio';

        await conn.sendMessage(m.chat, { audio: { url: json.result.url }, mimetype: 'audio/mpeg' }, { quoted: m });
      }
      else if (cmd === '.play8-mp4') {
        // Descargar mp4 vía API
        const apiRes = await fetch(`https://api.danielrrapi.repl.co/api/ytmp4?url=${encodeURIComponent(url)}`);
        const json = await apiRes.json();
        if (!json || !json.result || !json.result.url) throw 'No se pudo obtener el video';

        await conn.sendMessage(m.chat, { video: { url: json.result.url }, mimetype: 'video/mp4' }, { quoted: m });
      }

      await m.react('✅');
    } catch (e) {
      console.error(e);
      await m.react('⚠️');
      m.reply('✦ Error al descargar el archivo.');
    }

    return;
  }

  // Parte búsqueda y muestra botones
  const query = args.join(' ');
  const search = await yts(query);
  const video = search.videos[0];
  if (!video) return m.reply('✦ No se encontraron resultados.');

  const buttons = [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: '🎧 MP3',
        id: `.play8-mp3 ${video.url}`
      })
    },
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: '🎥 MP4',
        id: `.play8-mp4 ${video.url}`
      })
    }
  ];

  const caption = `🎵 *${video.title}*\n⏳ Duración: ${video.timestamp}\n📺 Canal: ${video.author.name}\n🔗 ${video.url}`;

  // Obtener miniatura
  let thumb;
  try {
    const resp = await fetch(video.thumbnail);
    thumb = await resp.buffer();
  } catch {
    thumb = null;
  }

  // Generar mensaje con botones nativos
  const { generateWAMessageFromContent, proto } = await import('@whiskeysockets/baileys');

  const imageMsg = thumb ? (await generateWAMessageFromContent(m.chat, { image: thumb }, { upload: conn.waUploadToServer })).message.imageMessage : null;

  const card = {
    body: proto.Message.InteractiveMessage.Body.fromObject({ text: caption }),
    footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: 'Proyecto G - Descargas YouTube' }),
    header: proto.Message.InteractiveMessage.Header.fromObject({
      hasMediaAttachment: !!imageMsg,
      imageMessage: imageMsg
    }),
    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
      buttons
    })
  };

  const message = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: 'Proyecto G - Descargas YouTube' }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: [card]
          })
        })
      }
    }
  }, { userJid: m.sender });

  await conn.relayMessage(m.chat, message.message, { messageId: message.key.id });
};

handler.help = ['play8 <texto>'];
handler.tags = ['downloader'];
handler.command = ['play8'];
export default handler;
