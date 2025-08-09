const handler = async (m, { conn, participants, usedPrefix, command }) => {
  const emoji = '🔪';

  // Detectar usuario a expulsar: o por mención o por mensaje citado
  let user;
  if (m.mentionedJid && m.mentionedJid.length) {
    user = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    user = m.quoted.sender;
  } else {
    return conn.reply(m.chat, `
┌──「 *Expulsión Fallida* 」
│ ${emoji} 𝘿𝙚𝙗𝙚𝙨 𝙢𝙚𝙣𝙘𝙞𝙤𝙣𝙖𝙧 𝙖 𝙖𝙡𝙜𝙪𝙞𝙚𝙣 𝙤 𝙘𝙞𝙩𝙖𝙧 𝙪𝙣 𝙢𝙚𝙣𝙨𝙖𝙟𝙚 𝙥𝙖𝙧𝙖 𝙚𝙭𝙥𝙪𝙡𝙨𝙖𝙧.
└───────❖`, m);
  }

  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
  const ownerBot = global.owner[0][0] + '@s.whatsapp.net';

  if (user === conn.user.jid) {
    return conn.reply(m.chat, `
┌──「 *Error* 」
│ ❌ 𝙉𝙤 𝙥𝙪𝙚𝙙𝙤 𝙚𝙭𝙥𝙪𝙡𝙨𝙖𝙧𝙢𝙚 𝙖 𝙢𝙞 𝙢𝙞𝙨𝙢𝙖.
└───────❖`, m);
  }

  if (user === ownerGroup) {
    return conn.reply(m.chat, `
┌──「 *Error* 」
│ 👑 𝙉𝙤 𝙥𝙪𝙚𝙙𝙤 𝙩𝙤𝙘𝙖𝙧 𝙖𝙡 𝙡í𝙙𝙚𝙧 𝙙𝙚𝙡 𝙜𝙧𝙪𝙥𝙤.
└───────❖`, m);
  }

  if (user === ownerBot) {
    return conn.reply(m.chat, `
┌──「 *Error* 」
│ 🌟 𝙀𝙨 𝙢𝙞 𝙘𝙧𝙚𝙖𝙙𝙤𝙧, 𝙣𝙤 𝙥𝙪𝙚𝙙𝙤 𝙚𝙭𝙥𝙪𝙡𝙨𝙖𝙧𝙡𝙤.
└───────❖`, m);
  }

  await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
  
  // Reaccionar al comando con el cuchillo
  await m.react('🔪');
  
  conn.reply(m.chat, `
╭─❖ 「 *Usuario Expulsado* 」 ❖─
│ ${emoji} 𝙀𝙡 𝙢𝙞𝙚𝙢𝙗𝙧𝙤 𝙛𝙪𝙚 𝙚𝙡𝙞𝙢𝙞𝙣𝙖𝙙𝙤 𝙘𝙤𝙣 𝙪𝙣 *𝘾𝙤𝙧𝙩𝙚 𝙇𝙞𝙢𝙥𝙞𝙤*. ${emoji}
╰─────────────❖`, m);
};

handler.help = ['k'];
handler.tags = ['grupo'];
handler.command = ['k','echar','hechar','sacar','ban'];
handler.admin = true;
handler.group = true;
handler.register = true;
handler.botAdmin = true;

export default handler;
