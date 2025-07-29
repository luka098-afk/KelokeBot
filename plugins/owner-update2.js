import { exec } from 'child_process';

let handler = async (m, { conn }) => {
  // Verificar que m y conn existan para evitar errores
  if (!m || !m.reply || !conn || !conn.reply) return;

  const fake = typeof fake !== 'undefined' ? fake : false;

  await m.reply(`Actualizando.`);

  exec('git pull', (err, stdout, stderr) => {
    if (err) {
      conn.reply(m.chat, `Error: No se pudo realizar la actualización.\nRazón: ${err.message}`, m);
      return;
    }

    if (stderr) {
      console.warn('Advertencia durante la actualización:', stderr);
    }

    if (stdout.includes('Already up to date.')) {
      conn.reply(m.chat, `*El bot ya está actualizado.*`, m, fake);
    } else {
      conn.reply(m.chat, `*Actualización realizada con éxito.*\n\n${stdout}`, m, fake);
    }
  });
};

handler.help = ['update2'];
handler.tags = ['owner'];
handler.command = ['update2'];
handler.rowner = true;

export default handler;
