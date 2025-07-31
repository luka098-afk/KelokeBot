import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

// Definir emojis y variables
const emoji = "📁";
const rwait = "⏳";
const done = "✅";
const error = "❌";
const dev = "Catbox Uploader Bot";

// Objeto fkontak para el contextInfo
const fkontak = {
  key: {
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast'
  },
  message: {
    contactMessage: {
      displayName: 'Catbox Uploader',
      vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:Uploader\nFN:Catbox Uploader\nitem1.TEL;waid=0:+0\nitem1.X-ABLabel:Ponsel\nEND:VCARD'
    }
  }
};

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  
  if (!mime) {
    return conn.reply(m.chat, `${emoji} Por favor, responde a un archivo válido (imagen, video, etc.).`, m);
  }

  await m.react(rwait);

  try {
    let media = await q.download();
    
    if (!media || media.length === 0) {
      await m.react(error);
      return conn.reply(m.chat, `${error} Error al descargar el archivo.`, m);
    }

    let isTele = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);
    let link = await catbox(media);

    if (!link || link.includes('error') || !link.startsWith('http')) {
      await m.react(error);
      return conn.reply(m.chat, `${error} Error al subir el archivo a Catbox.`, m);
    }

    let txt = `*乂 C A T B O X - U P L O A D E R 乂*\n\n`;
    txt += `*» Enlace* : ${link}\n`;
    txt += `*» Tamaño* : ${formatBytes(media.length)}\n`;
    txt += `*» Tipo* : ${mime}\n`;
    txt += `*» Expiración* : ${isTele ? 'No expira' : 'Permanente'}\n\n`;
    txt += `> *${dev}*`;

    // Enviar mensaje con el enlace
    await conn.sendMessage(m.chat, {
      text: txt,
      contextInfo: {
        externalAdReply: {
          title: 'Catbox Uploader',
          body: 'Archivo subido exitosamente',
          thumbnailUrl: isTele ? link : null,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: link
        }
      }
    }, { quoted: fkontak });

    await m.react(done);
    
  } catch (err) {
    console.error('Error en handler:', err);
    await m.react(error);
    await conn.reply(m.chat, `${error} Ocurrió un error al procesar el archivo: ${err.message}`, m);
  }
};

handler.help = ['tourl2'];
handler.tags = ['tools'];
handler.command = ['catbox', 'tourl2'];
handler.limit = true;
handler.register = true;

export default handler;

function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 B';
  }
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function catbox(content) {
  try {
    const { ext, mime } = (await fileTypeFromBuffer(content)) || { ext: 'bin', mime: 'application/octet-stream' };
    
    // Convertir buffer a ArrayBuffer si es necesario
    const arrayBuffer = content instanceof ArrayBuffer ? content : content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength);
    
    const blob = new Blob([arrayBuffer], { type: mime });
    const formData = new FormData();
    const randomBytes = crypto.randomBytes(5).toString("hex");
    
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", blob, `${randomBytes}.${ext}`);

    console.log(`Subiendo archivo: ${randomBytes}.${ext}, tipo: ${mime}`);

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.text();
    console.log('Respuesta de Catbox:', result);

    // Verificar si la respuesta es una URL válida
    if (result && result.startsWith('https://files.catbox.moe/')) {
      return result.trim();
    } else {
      throw new Error(`Respuesta inválida: ${result}`);
    }

  } catch (err) {
    console.error('Error en catbox():', err);
    throw new Error(`Error al subir a Catbox: ${err.message}`);
  }
}
