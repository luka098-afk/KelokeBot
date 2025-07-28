import fs from 'fs';

let handler = async (m, { conn, usedPrefix }) => {
  const emoji = '🔞'; // Define emoji
  const db = global.db; // Asegúrate de tener `global.db` definido en tu bot

  if (!db.data.chats[m.chat]?.nsfw && m.isGroup) {
    return m.reply(`${emoji} El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *${usedPrefix}nsfw on*`);
  }

  let who;
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0];
  } else if (m.quoted) {
    who = m.quoted.sender;
  } else {
    who = m.sender;
  }

  let name = await conn.getName(who);
  let name2 = await conn.getName(m.sender);
  await m.react('🥵');

  let str;
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    str = `\`${name2}\` *🔥 se descontroló y follo muy duro a* \`${name || who}\`.`;
  } else if (m.quoted) {
    str = `\`${name2}\` *😈 hizo travesuras con* \`${name || who}\`.`;
  } else {
    str = `\`${name2}\` *😏 está en modo caliente.*`;
  }

  if (m.isGroup) {
    // Videos NSFW (pon tus enlaces reales aquí)
    const pp1 = '';
    const pp2 = '';
    const pp3 = '';
    const pp4 = '';
    const pp5 = '';
    const pp6 = '';

    const videos = [pp1, pp2, pp3, pp4, pp5, pp6];
    const video = videos[Math.floor(Math.random() * videos.length)];

    let mentions = [who];
    await conn.sendMessage(
      m.chat,
      { video: { url: video }, gifPlayback: true, caption: str, mentions },
      { quoted: m }
    );
  }
};

handler.help = ['follar @tag'];
handler.tags = ['nsfw'];
handler.command = ['follar'];
handler.group = true;

export default handler;
