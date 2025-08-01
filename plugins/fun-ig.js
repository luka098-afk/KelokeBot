import fetch from 'node-fetch';

let handler = async (m, { args, usedPrefix, command }) => {
  const username = (args[0] || '').replace(/^@/, '').trim();
  if (!username) return m.reply(`📸 *Uso del comando:*\n${usedPrefix + command} @usuario_ig`);

  try {
    const apiUrl = `https://www.save-free.com/es/profile-downloader/?q=${username}`;
    const html = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    }).then(res => res.text());

    const imgMatch = html.match(/<img[^>]+src="([^"]+)"[^>]*class="profile-picture-img"/i);
    if (!imgMatch || !imgMatch[1]) {
      return m.reply(`❌ No se pudo obtener la imagen de perfil de @${username}.\n\n🔗 https://instagram.com/${username}`);
    }

    const imageUrl = imgMatch[1];

    const buffer = await fetch(imageUrl).then(res => res.buffer());

    await conn.sendFile(m.chat, buffer, 'perfil.jpg', `📸 *Foto de perfil de* @${username}\n🔗 https://instagram.com/${username}`, m);
  } catch (e) {
    console.error(e);
    m.reply(`❌ Error al obtener el perfil de @${username}\n\n🔗 https://instagram.com/${username}`);
  }
};

handler.command = /^ig$/i;
export default handler;
