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
  let nameWho = await conn.getName(who);
  let nameSender = await conn.getName(sender);

  m.react('🥵');

  let text;
  let mentions;

  if (m.mentionedJid.length > 0) {
    // Mencionar a los dos: sender y quien fue mencionado
    text = `@${sender.split('@')[0]} *tiene sexo fuertemente con* @${who.split('@')[0]}.`;
    mentions = [sender, who];
  } else if (m.quoted) {
    text = `@${sender.split('@')[0]} *tiene sexo con* @${who.split('@')[0]}.`;
    mentions = [sender, who];
  } else {
    // Solo menciona al sender porque no hay otro
    text = `@${sender.split('@')[0]} *tiene sexo apasionadamente.*`;
    mentions = [sender];
  }

  await conn.sendMessage(m.chat, { text, mentions }, { quoted: m });
};

handler.help = ['sexo/sex @tag'];
handler.tags = ['nsfw'];
handler.command = ['sexo', 'sex'];
handler.group = true;

export default handler;
