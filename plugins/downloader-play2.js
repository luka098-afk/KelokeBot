import fetch from "node-fetch"
import yts from "yt-search"

const handler = async (m, { conn, text, usedPrefix }) => {
  if (!text.trim()) {
    return conn.reply(m.chat, `✦ Escribe el nombre de la canción o artista\nEjemplo: *${usedPrefix}video karol g tusa*`, m)
  }

  await m.react('🔍')

  try {
    const search = await yts(text)
    if (!search.all.length) {
      return m.reply("✦ No encontré resultados con ese nombre. ¿Puedes intentar con otro?")
    }

    const videoInfo = search.all[0]
    const { title, thumbnail, timestamp, views, ago, url } = videoInfo
    const vistas = formatViews(views)

    const caption = `
🎬 *Título:* ${title}
⏱️ *Duración:* ${timestamp}
📺 *Canal:* ${videoInfo.author?.name || "Desconocido"}
👁️ *Vistas:* ${vistas}
📅 *Publicado:* ${ago}
🔗 *Link:* ${url}

Hinata está descargando tu video en MP4~ 💮
    `.trim()

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption
    }, { quoted: m })

    await m.react('📥')

    // APIs de respaldo
    const sources = [
      `https://api.siputzx.my.id/api/d/ytmp4?url=${url}`,
      `https://api.zenkey.my.id/api/download/ytmp4?apikey=zenkey&url=${url}`,
      `https://axeel.my.id/api/download/video?url=${encodeURIComponent(url)}`,
      `https://delirius-apiofc.vercel.app/download/ytmp4?url=${url}`
    ]

    let success = false
    for (let api of sources) {
      try {
        const res = await fetch(api)
        const json = await res.json()

        const downloadUrl = json?.data?.dl || json?.result?.download?.url || json?.downloads?.url || json?.data?.download?.url
        if (!downloadUrl) continue

        success = true
        await conn.sendMessage(m.chat, {
          video: { url: downloadUrl },
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          caption: "✨ ¡Aquí está tu video en MP4! Que lo disfrutes 💿",
          thumbnail: { url: thumbnail }
        }, { quoted: m })

        break
      } catch (e) {
        console.error(`❌ Error con ${api}:`, e.message)
      }
    }

    if (!success) {
      return m.reply("✦ No se pudo descargar el video. Intenta con otro título o más tarde.")
    }

  } catch (e) {
    console.error("❌ Error general:", e)
    return m.reply("✦ Hubo un error inesperado al procesar tu solicitud.")
  }
}

handler.command = ["video"]
handler.tags = ["downloader"]
handler.help = ["video <nombre>"]
handler.register = true

export default handler

function formatViews(views) {
  if (typeof views !== "number" || isNaN(views)) return "Desconocido"
  return views >= 1000
    ? (views / 1000).toFixed(1) + "k (" + views.toLocaleString() + ")"
    : views.toString()
}
