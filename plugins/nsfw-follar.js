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

  let sender = m.sender;
  let name = await conn.getName(who);
  let name2 = await conn.getName(sender);

  await m.react('🥵');

  let str;
  let mentions;

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    str = `@${sender.split('@')[0]} *🔥 se descontroló y follo muy duro a* @${who.split('@')[0]}.`;
    mentions = [sender, who];
  } else if (m.quoted) {
    str = `@${sender.split('@')[0]} *😈 hizo travesuras con* @${who.split('@')[0]}.`;
    mentions = [sender, who];
  } else {
    str = `@${sender.split('@')[0]} *😏 está en modo caliente.*`;
    mentions = [sender];
  }

  if (m.isGroup) {
    await conn.sendMessage(
      m.chat,
      { text: str, mentions },
      { quoted: m }
    );
  }
};

handler.help = ['follar @tag'];
handler.tags = ['nsfw'];
handler.command = ['follar'];
handler.group = true;

export default handler;
