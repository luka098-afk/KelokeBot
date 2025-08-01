import fetch from 'node-fetch';

let handler = async (m, { args, usedPrefix, command }) => {
  const username = (args[0] || '').replace(/^@/, '').trim();
  if (!username) return m.reply(`📸 Uso:\n${usedPrefix + command} @usuario_ig`);

  try {
    const res = await fetch(`https://www.instagram.com/${username}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'es' }
    });
    const html = await res.text();

    const img = html.match(/"profile_pic_url_hd":"([^"]+)"/)?.[1]?.replace(/\\u0026/g, '&');
    if (!img) throw new Error('No se encontró imagen');

    const imgRes = await fetch(img);
    if (!imgRes.ok) throw new Error('Error al descargar');

    const buffer = await imgRes.buffer();
    await conn.sendFile(m.chat, buffer, 'perfil.jpg',
      `📸 Foto de perfil de @${username}\n🔗 https://instagram.com/${username}`, m);
  } catch (e) {
    console.error(e);
    m.reply(`❌ No se pudo obtener la imagen de perfil de @${username}\n🔗 https://instagram.com/${username}`);
  }
};

handler.command = /^ig$/i;
export default handler;
