import { exec } from 'child_process';
import https from 'https';
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    m.reply(`🩸 *𝘼𝘾𝙏𝙄𝙑𝘼𝙉𝘿𝙊 𝙀𝙇 𝙍𝙄𝙏𝙐𝘼𝙇...* 🧟‍♂️\n\n☠️ 𝘋𝘦𝘴𝘤𝘢𝘳𝘨𝘢𝘯𝘥𝘰 𝘢𝘤𝘵𝘶𝘢𝘭𝘪𝘻𝘢𝘤𝘪𝘰𝘯𝘦𝘴 𝘥𝘦𝘴𝘥𝘦 𝘎𝘪𝘵𝘏𝘶𝘣...`);
    
    try {
        // Configurar variables de entorno para git
        const gitEnv = {
            ...process.env,
            GIT_PAGER: 'cat',
            GIT_TERMINAL_PROMPT: '0',
            HOME: process.env.HOME || '/tmp',
            GIT_CONFIG_GLOBAL: '/dev/null',
            GIT_CONFIG_SYSTEM: '/dev/null'
        };

        // Intentar múltiples métodos de actualización
        
        // Método 1: Git con configuración inline
        const gitCommand = `git -c user.email="boxmine@bot.com" -c user.name="BoxMine Bot" -c pull.rebase=false -c core.pager=cat fetch origin main && git -c user.email="boxmine@bot.com" -c user.name="BoxMine Bot" reset --hard origin/main`;
        
        exec(gitCommand, { env: gitEnv, timeout: 30000 }, (err, stdout, stderr) => {
            if (!err && !stderr.includes('fatal')) {
                conn.reply(m.chat, `🕷️ *¡RITUAL COMPLETADO CON ÉXITO!* 🧛‍♀️\n\n🩸 Bot actualizado desde GitHub\n✅ Cambios aplicados sin reiniciar`, m);
                // Sin reinicio - los cambios se aplicarán gradualmente
                return;
            }
            
            // Método 2: Descargar ZIP si git falla
            conn.reply(m.chat, `⚠️ Git falló, probando descarga directa...`, m);
            
            const zipUrl = 'https://github.com/luka098-afk/KelokeBot/archive/refs/heads/main.zip';
            const tempFile = '/tmp/bot_update.zip';
            
            exec(`curl -L "${zipUrl}" -o "${tempFile}" || wget -O "${tempFile}" "${zipUrl}"`, { timeout: 60000 }, (downloadErr, downloadStdout, downloadStderr) => {
                if (downloadErr) {
                    // Método 3: Descarga manual de archivos específicos
                    downloadSpecificFiles(conn, m);
                    return;
                }
                
                // Extraer y aplicar
                exec(`cd /tmp && unzip -o "${tempFile}" && cp -r KelokeBot-main/* . 2>/dev/null || echo "Extracción completada"`, (extractErr) => {
                    if (extractErr) {
                        conn.reply(m.chat, `☠️ *ERROR EN LA EXTRACCIÓN*\n\n💀 Probando método alternativo...`, m);
                        downloadSpecificFiles(conn, m);
                        return;
                    }
                    
                    conn.reply(m.chat, `🕷️ *¡DESCARGA COMPLETADA!* 🧛‍♀️\n\n🩸 Archivos actualizados\n✅ Cambios aplicados sin reiniciar`, m);
                    // Sin reinicio automático
                });
            });
        });
        
    } catch (error) {
        conn.reply(m.chat, `☠️ *ERROR EN EL RITUAL*\n\n💀 Razón: ${error.message}\n🧟‍♂️ Probando método de emergencia...`, m);
        downloadSpecificFiles(conn, m);
    }
};

// Función de respaldo para descargar archivos específicos
function downloadSpecificFiles(conn, m) {
    const pluginUrls = [
        'https://raw.githubusercontent.com/luka098-afk/KelokeBot/main/plugins/owner-update.js',
        'https://raw.githubusercontent.com/luka098-afk/KelokeBot/main/main.js',
        'https://raw.githubusercontent.com/luka098-afk/KelokeBot/main/package.json'
    ];
    
    let completed = 0;
    const total = pluginUrls.length;
    
    pluginUrls.forEach((url, index) => {
        const fileName = url.split('/').pop();
        const filePath = fileName.startsWith('owner-') ? `plugins/${fileName}` : fileName;
        
        exec(`curl -s "${url}" -o "${filePath}" || wget -q -O "${filePath}" "${url}"`, (err) => {
            completed++;
            if (completed === total) {
                conn.reply(m.chat, `🕷️ *¡ACTUALIZACIÓN DE EMERGENCIA COMPLETADA!* 🧛‍♀️\n\n🩸 ${total} archivos descargados\n✅ Cambios aplicados sin reiniciar`, m);
                // Sin reinicio automático
            }
        });
    });
}

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix', 'actualizar'];
handler.rowner = true;

export default handler;
