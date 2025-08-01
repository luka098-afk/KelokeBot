import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';

let handler = async (m, { args, text, usedPrefix, command }) => {
  const user = (args[0] || '').replace(/^@/, '').trim();
  if (!user) return m.reply(`📸 *Uso del comando:*\n${usedPrefix + command} @usuario_ig`);

  const url = `https://instagram.com/${user}`;
  let res, html;

  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'es-ES,es;q=0.9',
      },
    });
    html = await res.text();
  } catch {
    return m.reply(`❌ No se pudo acceder al perfil de @${user}\n\n🔗 Enlace: https://instagram.com/${user}`);
  }

  let img = html.match(/"profile_pic_url_hd":"([^"]+)"/)?.[1] || html.match(/<meta property="og:image" content="([^"]+)"\/?>/)?.[1];

  if (!img) {
    return m.reply(`❌ No se pudo obtener el perfil de @${user}\n\n🔍 Asegúrate de que:\n• El nombre de usuario sea correcto\n• El perfil no esté restringido o eliminado\n\n🔗 Enlace: https://instagram.com/${user}`);
  }

  img = img.replace(/\\u0026/g, '&'); // Reemplazar caracteres escapados

  try {
    const pic = await fetch(img);
    const buffer = await pic.buffer();
    await conn.sendFile(m.chat, buffer, 'perfil.jpg', `📸 *Foto de perfil de* @${user}\n🔗 https://instagram.com/${user}`, m, false, { mentions: [m.sender] });
  } catch {
    return m.reply(`❌ Error al descargar la imagen de perfil.`);
  }
};

handler.command = /^ig$/i;
export default handler;
