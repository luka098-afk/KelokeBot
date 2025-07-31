const handler = async (m, {conn, isOwner}) => {
  const chats = Object.entries(global.db.data.chats).filter((chat) => chat[1].isBanned);
  const users = Object.entries(global.db.data.users).filter((user) => user[1].banned);
  
  // Preparar las menciones para usuarios
  const userMentions = [];
  const userList = users.map(([jid], i) => {
    // Asegurar formato JID correcto
    const userJid = jid.includes('@') ? jid : `${jid}@s.whatsapp.net`;
    const number = userJid.split('@')[0];
    
    if (isOwner) {
      userMentions.push(userJid);
      return `├ @${number}`;
    } else {
      return `├ ${userJid}`;
    }
  }).join('\n');

  // Preparar lista de chats (sin menciones, son grupos)
  const chatList = chats.map(([jid], i) => {
    return `├ ${jid}`;
  }).join('\n');

  const caption = `
┌〔 Usuarios - Baneados 〕
├ Total : ${users.length}${users.length > 0 ? '\n' + userList : ''}
└────

┌〔 Chats - Baneados 〕
├ Total : ${chats.length}${chats.length > 0 ? '\n' + chatList : ''}
└────
`.trim();

  // Enviar con menciones correctas solo para usuarios
  m.reply(caption, null, { mentions: isOwner ? userMentions : [] });
};

handler.help = ['banlist','listban'];
handler.tags = ['owner'];
handler.command = ['banlist','listban'];
handler.rowner = true;

export default handler;
