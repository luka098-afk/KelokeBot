import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, participants }) {
  if (!m.messageStubType || !m.isGroup) return true;

  const numeroUsuario = m.messageStubParameters?.[0]?.split('@')[0];
  const jidUsuario = m.messageStubParameters?.[0];
  if (!numeroUsuario) return;

  const fkontak = {
    "key": {
      "participants": "0@s.whatsapp.net",
      "remoteJid": "status@broadcast",
      "fromMe": false,
      "id": "Halo"
    },
    "message": {
      "contactMessage": {
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    "participant": "0@s.whatsapp.net"
  };

  const chat = global.db.data.chats[m.chat];

  if (chat?.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const mensajeBienvenida = `🎃 Bienvenid@ al grupo, @${numeroUsuario} 👻`;
    await conn.sendMessage(m.chat, { text: mensajeBienvenida, mentions: [jidUsuario] }, { quoted: fkontak });
  }

  if (
    chat?.welcome &&
    (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
     m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)
  ) {
    const mensajeSalida = `🪦 Hasta luego, @${numeroUsuario}... 💀`;
    await conn.sendMessage(m.chat, { text: mensajeSalida, mentions: [jidUsuario] }, { quoted: fkontak });
  }
}
