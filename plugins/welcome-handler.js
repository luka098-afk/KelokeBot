// welcome-handler.js

export async function handler(m, { conn, text, usedPrefix }) {
  if (!m.isGroup) return m.reply('Este comando solo funciona en grupos.');

  const chat = global.db.data.chats[m.chat];
  if (!chat) return m.reply('Error: Chat no encontrado en la base de datos.');

  const arg = (text || '').toLowerCase();

  if (arg === 'on') {
    chat.welcome = true;
    await conn.sendMessage(m.chat, {
      text: `✅ Bienvenida activada para este grupo.`,
    });
  } else if (arg === 'off') {
    chat.welcome = false;
    await conn.sendMessage(m.chat, {
      text: `❌ Bienvenida desactivada para este grupo.`,
    });
  } else {
    await conn.sendMessage(m.chat, {
      text: `Usa el comando así:\n${usedPrefix}welcome on\n${usedPrefix}welcome off`,
    });
  }

  // Guardar la base de datos si no está automático:
  if (global.db?.write) await global.db.write();
}

handler.command = ['welcome'];
handler.group = true;

export default handler;


// before.js

export async function before(m, { conn }) {
  if (!m.isGroup || !m.messageStubType || !m.messageStubParameters) return;

  if (!global.db.data.chats[m.chat].welcome) return;

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participants = m.messageStubParameters || [];
  const date = new Date();
  const fecha = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  for (const user of participants) {
    let name = await conn.getName(user);
    const taguser = '@' + user.split('@')[0];
    const gifUrl = 'https://files.catbox.moe/3nhupk.gif'; // tu GIF                                                         
    if (m.messageStubType === 27 || m.messageStubType === 31) {
      // Bienvenida
      await conn.sendMessage(m.chat, {
        video: { url: gifUrl },
        gifPlayback: true,
        caption: `🎉 ¡Hola ${taguser}! Bienvenido al grupo *${groupMetadata.subject}*.\n\nEsperamos que disfrutes y aportes mucho.\n\n🗓️ Fecha: ${fecha}`,
        mentions: [user]
      });
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      // Despedida
      await conn.sendMessage(m.chat, {
        video: { url: gifUrl },
        gifPlayback: true,
        caption: `😢 ${taguser} ha salido del grupo *${groupMetadata.subject}*.\n\n¡Te deseamos lo mejor!`,
        mentions: [user]
      });
    }
  }
}
