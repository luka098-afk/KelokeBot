import { downloadMediaMessage } from '@whiskeysockets/baileys';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const tmpPath = './temp'; // carpeta temporal
if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);

export const stickerCommand = async (m, { conn, args, command, isOwner }) => {
  if (!m.quoted || !m.quoted.imageMessage) {
    await conn.sendMessage(m.chat, { text: '📷 Responde a una imagen para convertirla en sticker.' }, { quoted: m });
    return;
  }

  try {
    // Descargar imagen
    const buffer = await downloadMediaMessage(m.quoted, 'buffer', {}, { logger: console });
    const inputPath = path.join(tmpPath, `${Date.now()}.jpg`);
    const outputPath = path.join(tmpPath, `${Date.now()}.webp`);
    fs.writeFileSync(inputPath, buffer);

    // Convertir a sticker (formato webp)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-vcodec', 'libwebp',
          '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white',
          '-lossless', '1',
          '-compression_level', '6',
          '-qscale', '50',
          '-preset', 'default'
        ])
        .toFormat('webp')
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    const stickerBuffer = fs.readFileSync(outputPath);
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

    // Limpieza
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al crear el sticker.' }, { quoted: m });
  }
};
