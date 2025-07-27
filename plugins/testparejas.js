import fs from 'fs';
import path from 'path';

const handler = async (m, { conn }) => {
  const filePath = path.join(process.cwd(), 'database', 'parejas.json');

  if (!fs.existsSync(filePath)) {
    return m.reply('❌ No existe el archivo parejas.json en la carpeta database.');
  }

  let parejas;
  try {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    parejas = JSON.parse(rawData);
  } catch (e) {
    return m.reply('❌ Error al leer o parsear parejas.json:\n' + e.message);
  }

  const keys = Object.keys(parejas);
  await m.reply(`✅ Archivo leído correctamente. Claves encontradas:\n${keys.join('\n') || '(ninguna clave)'}`);
};

handler.command = ['testparejas'];
handler.tags = ['test'];
handler.help = ['testparejas'];

export default handler;
