import axios from 'axios';
import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const pins = async (judul) => {
  try {
    const res = await axios.get(`https://anime-xi-wheat.vercel.app/api/pinterest?q=${encodeURIComponent(judul)}`);
    if (Array.isArray(res.data.images)) {
      return res.data.images.map(url => ({
        image_large_url: url,
        image_medium_url: url,
        image_small_url: url
      }));
    }
    return [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// Almacenar resultados por chat para poder cargar más imágenes
const chatResults = new Map();

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `⚰️ Ingresa un texto. Ejemplo: .pinterest gatos`, m);

  try {
    await m.react('🕸️');

    // Buscar nuevas imágenes
    const results = await pins(text);
    if (!results || results.length === 0) {
      await m.react('❌');
      return conn.reply(m.chat, `🎃 No se encontraron resultados para "${text}".`, m);
    }

    // Guardar resultados y reiniciar índice
    chatResults.set(m.chat, {
      images: results,
      currentIndex: 0,
      searchTerm: text
    });

    await sendSingleImageWithButton(conn, m, results[0], text, 0, results.length);
    await m.react('🦇');

  } catch (error) {
    console.error('Error en handler:', error);
    await m.react('💀');
    conn.reply(m.chat, '💀 Error al obtener imágenes de Pinterest.', m);
  }
};

const sendSingleImageWithButton = async (conn, m, imageData, searchTerm, currentIndex, totalImages) => {
  try {
    const imageUrl = imageData.image_large_url || imageData.image_medium_url || imageData.image_small_url;
    
    // Crear mensaje interactivo con botón usando proto
    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `⚱️ Resultado de: ${searchTerm}\n🕯️ Imagen ${currentIndex + 1} de ${totalImages}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: '🎃 Presiona el botón para ver otra imagen'
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: true,
              imageMessage: await conn.prepareMessage(m.chat, { image: { url: imageUrl } }).then(msg => msg.message.imageMessage)
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({
                    display_text: '🕷️ NUEVA IMAGEN',
                    id: `nextpinterest_${m.chat}_${currentIndex}`
                  })
                }
              ]
            })
          })
        }
      }
    }, {});

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    
  } catch (error) {
    console.error('Error enviando imagen con botón:', error);
    // Fallback: enviar imagen simple si falla el botón
    await conn.sendMessage(m.chat, {
      image: { url: imageData.image_large_url || imageData.image_medium_url || imageData.image_small_url },
      caption: `⚱️ Resultado de: ${searchTerm}\n🕯️ Imagen ${currentIndex + 1} de ${totalImages}\n\n💀 Usa el comando nuevamente para ver más imágenes.`
    }, { quoted: m });
  }
};

// Handler separado para los botones (debe ser registrado en el bot principal)
const handleButtonResponse = async (m, conn) => {
  try {
    const messageType = Object.keys(m.message)[0];
    if (messageType !== 'interactiveResponseMessage') return;

    const response = m.message.interactiveResponseMessage;
    let buttonId = '';
    
    // Diferentes formas de obtener el ID del botón según la versión
    if (response.nativeFlowResponseMessage?.paramsJson) {
      const params = JSON.parse(response.nativeFlowResponseMessage.paramsJson);
      buttonId = params.id;
    } else if (response.contextInfo?.quotedMessage?.buttonsMessage) {
      buttonId = response.selectedButtonId;
    }

    if (!buttonId || !buttonId.startsWith('nextpinterest_')) return;

    const chatId = m.chat;
    const chatData = chatResults.get(chatId);
    
    if (!chatData) {
      return conn.reply(m.chat, '🦴 No hay búsqueda activa. Usa .pinterest [término] primero.', m);
    }

    await m.react('⚰️');
    
    // Avanzar al siguiente índice
    chatData.currentIndex = (chatData.currentIndex + 1) % chatData.images.length;
    
    const nextImage = chatData.images[chatData.currentIndex];
    await sendSingleImageWithButton(conn, m, nextImage, chatData.searchTerm, chatData.currentIndex, chatData.images.length);
    
    await m.react('🕸️');
    
  } catch (error) {
    console.error('Error manejando botón:', error);
    conn.reply(m.chat, '💀 Error al cargar la siguiente imagen.', m);
  }
};

handler.help = ['pinterest'];
handler.command = ['pinterest', 'pin'];
handler.tags = ['buscador'];
handler.register = true;

// Exportar también el handler de botones para que pueda ser usado en el bot principal
handler.handleButtonResponse = handleButtonResponse;

export default handler;
