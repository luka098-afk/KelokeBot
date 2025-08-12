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

  let sender = m.sender;
  let name = await conn.getName(who);
  let name2 = await conn.getName(sender);

  await m.react('🥵');

  let str;
  let mentions;

  if (m.mentionedJid.length > 0) {
    str = `@${sender.split('@')[0]} *acabás de violar a la putita de* @${who.split('@')[0]} *mientras te decía "metemela durooo más durooo que rico pitote"...*\n*Tenemos que volver a sudar juntos!!.*`;
    mentions = [sender, who];
  } else if (m.quoted) {
    str = `@${sender.split('@')[0]} *violaste a la zorra mal parida de* @${who.split('@')[0]} *mientras te decía "metemela durooo más durooo que rico pitote"...*\n*Tenemos que volver a sudar juntos!!.*`;
    mentions = [sender, who];
  } else {
    str = `@${sender.split('@')[0]} *violó a alguien random del grupo por puta.*`.trim();
    mentions = [sender];
  }

  await conn.sendMessage(m.chat, { text: str, mentions }, { quoted: m });
};

handler.help = ['violar/perra @tag'];
handler.tags = ['nsfw'];
handler.command = ['violar', 'perra'];
handler.group = true;

export default handler;
