import yts from 'yt-search';
import fetch from 'node-fetch';
const { generateWAMessageFromContent, generateWAMessageContent, proto } = (await import('@whiskeysockets/baileys')).default;

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return conn.reply(m.chat, `*❗ Ingresa un título para buscar en YouTube.*\n✧ \`Ejemplo:\` ${usedPrefix}${command} Joji - Ew`, m);

  await m.react('🔍');

  try {
    let query = args.join(" ");
    let res = await yts(query);
    let video = res.videos[0];

    if (!video) throw 'No se encontró el video.';

    const imageRes = await fetch(video.thumbnail);
    const imageBuffer = await imageRes.buffer();

    const imageMsg = await generateWAMessageContent({ image: imageBuffer }, {
      upload: conn.waUploadToServer
    });

    const caption = `🎧 *${video.title}*\n\n⏱️ *Duración:* ${video.timestamp}\n📺 *Canal:* ${video.author.name}\n🔗 *URL:* ${video.url}`;

    const buttons = [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '🎧 Descargar MP3',
          url: `https://wa.me/?text=${encodeURIComponent(`${usedPrefix}ytmp3 ${video.url}`)}`
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '🎥 Descargar MP4',
          url: `https://wa.me/?text=${encodeURIComponent(`${usedPrefix}ytmp4 ${video.url}`)}`
        })
      }
    ];

    const card = {
      body: proto.Message.InteractiveMessage.Body.fromObject({ text: caption }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: 'Proyecto G - Descargas YouTube' }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        hasMediaAttachment: true,
        imageMessage: imageMsg.imageMessage
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons
      })
    };

    const msg = generateWAMessageFromContent(m.chat, {
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

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
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
