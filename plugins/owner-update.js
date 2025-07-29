import { exec } from 'child_process';

let handler = async (m, { conn }) => {
  m.reply(`🩸 *𝘼𝘾𝙏𝙄𝙑𝘼𝙉𝘿𝙊 𝙀𝙇 𝙍𝙄𝙏𝙐𝘼𝙇...* 🧟‍♂️\n\n☠️ 𝘌𝘭 𝘣𝘰𝘵 𝘴𝘦 𝘦𝘴𝘵𝘢́ 𝘢𝘤𝘵𝘶𝘢𝘭𝘪𝘻𝘢𝘯𝘥𝘰 𝘥𝘦𝘴𝘥𝘦 𝘭𝘢𝘴 𝘱𝘳𝘰𝘧𝘶𝘯𝘥𝘪𝘥𝘢𝘥𝘦𝘴...`);

  exec('git pull', (err, stdout, stderr) => {
    if (err) {
      conn.reply(m.chat, `☠️ *ERROR EN EL RITUAL*\n\n💀 Razón: ${err.message}`, m);
      return;
    }

    if (stderr) {
      console.warn('⚠️ Advertencia durante la actualización:', stderr);
    }

    if (stdout.includes('Already up to date.')) {
      conn.reply(m.chat, `🎃 *¡Ya estás malditamente actualizado!* 🔪\n\nNo hay cambios que absorber...`, m);
    } else {
      conn.reply(m.chat, `🕷️ *¡RITUAL COMPLETADO CON ÉXITO!* 🧛‍♀️\n\n🩸 Cambios absorbidos:\n\`\`\`${stdout.trim()}\`\`\``, m);
    }
  });
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix'];
handler.rowner = true;

export default handler;
