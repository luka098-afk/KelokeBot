const options = {
  nsfw: 'nsfw',
  reaction: 'reaction',
  antilink: 'antilink',
  modoadmin: 'modoadmin',
  detect: 'detect',
  welcome: 'welcome',
  isbanned: 'isbanned'
};

const handler = async (m, { conn, command }) => {
  const chat = global.db.data.chats[m.chat] || {};
  const cmd = command.toLowerCase();

  if (cmd === 'config') {
    // Mostrar el estado de todas las opciones
    let text = '╭━━*GROUP CONFIGURATION*━━╮\n';
    for (const key in options) {
      const state = chat[key] ? '✅ ON' : '❌ OFF';
      text += `┃ *${options[key]}:* ${state}\n`;
    }
    text += '╰━━━━━━━━━━￶━━━━━━━￶━━━━￶╯';
    return conn.reply(m.chat, text, m);
  }

  if (options[cmd]) {
    chat[cmd] = !chat[cmd];
    const state = chat[cmd] ? 'enabled ✅' : 'disabled ❌';
    return conn.reply(m.chat, `*${cmd}* has been ${state}.`, m);
  }
};

handler.command = /^(config|nsfw|reaction|antilink|modoadmin|detect|welcome|isbanned)$/i;
handler.group = true;
handler.tags = ['group'];
handler.help = ['config', 'nsfw', 'reaction', 'antilink', 'modoadmin', 'detect', 'welcome', 'isbanned'].map(c => `.${c}`);

export default handler;
