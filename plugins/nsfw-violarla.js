import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return m.reply(`🥵 El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *#nsfw on*`);
  }

  let who;
  if (m.mentionedJid.length > 0) {
    who = m.mentionedJid[0];
  } else if (m.quoted) {
    who = m.quoted.sender;
  } else {
    who = m.sender;
  }

  let name = conn.getName(who);
  let name2 = conn.getName(m.sender);
  m.react('🥵');

  let str;
  if (m.mentionedJid.length > 0) {
    str = `\`${name2}\` *acabás de violar a la putita de* \`${name || who}\` *mientras te decía "metemela durooo más durooo que rico pitote"...*\n*Tenemos que volver a sudar juntos!!.*`;
  } else if (m.quoted) {
    str = `\`${name2}\` *violaste a la zorra mal parida de* \`${name || who}\` *mientras te decía "metemela durooo más durooo que rico pitote"...*\n*Tenemos que volver a sudar juntos!!.*`;
  } else {
    str = `\`${name2}\` *violó a alguien random del grupo por puta.*`.trim();
  }

  let mentions = [who];
  await conn.sendMessage(m.chat, { text: str, mentions }, { quoted: m });
};

handler.help = ['violar/perra @tag'];
handler.tags = ['nsfw'];
handler.command = ['violar', 'perra'];
handler.group = true;

export default handler;
