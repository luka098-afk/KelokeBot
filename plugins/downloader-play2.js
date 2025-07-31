import fetch from "node-fetch";
import yts from "yt-search";
import axios from "axios";

const formatAudio = ["mp3", "m4a", "webm", "acc", "flac", "opus", "ogg", "wav"];
const formatVideo = ["360", "480", "720", "1080", "1440", "4k"];

const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format) && !formatVideo.includes(format)) {
      throw new Error("Formato no soportado.");
    }

    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}`,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    };

    try {
      const response = await axios.request(config);
      if (response.data?.success) {
        const { id, title, info } = response.data;
        const { image } = info;
        const downloadUrl = await ddownr.cekProgress(id);

        return {
          id,
          image,
          title,
          downloadUrl,
        };
      } else {
        throw new Error("Fallo al obtener los detalles del video.");
      }
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  },

  cekProgress: async (id) => {
    const config = {
      method: "GET",
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    };

    try {
      while (true) {
        const response = await axios.request(config);
        if (response.data?.success && response.data.progress === 1000) {
          return response.data.download_url;
        }
        await new Promise((r) => setTimeout(r, 5000));
      }
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  },
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text || !text.trim()) {
      return conn.reply(
        m.chat,
        `*[❗] Inserta el nombre o link del video de YouTube que deseas buscar o descargar.*`,
        m
      );
    }

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply("*[❗] No se encontró ningún resultado.*");
    }

    const videoInfo = search.all[0];
    const { title, thumbnail, views, url } = videoInfo;
    const thumb = (await conn.getFile(thumbnail))?.data;
    const infoMessage = `➤ ▢ *Título:*\n> ${title}\n➤ ▢ *Vistas:*\n> ${formatViews(views)}\n➤ ▢ *Enlace:*\n> ${url}\n\n🎧 Procesando tu descarga...`;

    // Enviar imagen remota sin error de ruta
    await conn.sendMessage(m.chat, {
      image: { url: 'https://files.catbox.moe/kjh6ga.jpg' },
      caption: infoMessage
    }, { quoted: m });

    if (command === 'play2') {
      const audio = await ddownr.download(url, "mp3");
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: audio.downloadUrl },
          mimetype: "audio/mpeg",
          ptt: false,
          contextInfo: {
            externalAdReply: {
              title,
              body: "YouTube - MP3",
              mediaUrl: url,
              sourceUrl: url,
              thumbnail: thumb,
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        },
        { quoted: m }
      );
    } else if (command === "video" || command === "mp4") {
      const sources = [
        `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
        `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${url}`,
        `https://axeel.my.id/api/download/video?url=${encodeURIComponent(url)}`,
        `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`,
      ];

      let success = false;

      for (let source of sources) {
        try {
          const res = await fetch(source);
          const json = await res.json();
          let downloadUrl =
            json?.data?.dl ||
            json?.result?.download?.url ||
            json?.downloads?.url ||
            json?.data?.download?.url;

          if (downloadUrl) {
            await conn.sendMessage(
              m.chat,
              {
                video: { url: downloadUrl },
                fileName: `${title}.mp4`,
                mimetype: "video/mp4",
                caption: `▢ *Título:* ${title}`,
                thumbnail: thumb,
                contextInfo: {
                  externalAdReply: {
                    title,
                    body: videoInfo.author?.name || "YouTube",
                    mediaUrl: url,
                    sourceUrl: url,
                    thumbnail: thumb,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                  },
                },
              },
              { quoted: m }
            );
            success = true;
            break;
          }
        } catch (e) {
          console.log("Fuente fallida:", source, "-", e.message);
        }
      }

      if (!success) {
        return m.reply(`❌ No se pudo descargar el video.`);
      }
    } else {
      throw new Error("Comando no reconocido.");
    }
  } catch (error) {
    console.error(error);
    return m.reply(`❌ *Error:* ${error.message}`);
  }
};

handler.help = ["play2", "video", "mp4"];
handler.tags = ["descargas"];
handler.command = ["play2", "video", "mp4"];

export default handler;

function formatViews(views) {
  return views >= 1000
    ? (views / 1000).toFixed(1) + "k (" + views.toLocaleString() + ")"
    : views.toString();
}
