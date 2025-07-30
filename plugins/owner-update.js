import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let handler = async (m, { conn }) => {
    m.reply(`🩸 *𝘼𝘾𝙏𝙄𝙑𝘼𝙉𝘿𝙊 𝙀𝙇 𝙍𝙄𝙏𝙐𝘼𝙇...* 🧟‍♂️\n\n☠️ 𝘌𝘭 𝘣𝘰𝘵 𝘴𝘦 𝘦𝘴𝘵𝘢́ 𝘢𝘤𝘵𝘶𝘢𝘭𝘪𝘻𝘢𝘯𝘥𝘰 𝘥𝘦𝘴𝘥𝘦 𝘭𝘢𝘴 𝘱𝘳𝘰𝘧𝘶𝘯𝘥𝘪𝘥𝘢𝘥𝘦𝘴...`);
    
    try {
        // Configurar git primero
        const gitConfig = [
            'git config user.email "krebskrebs17@gmail.com"',
            'git config user.name "Luka098"',
            'git config pull.rebase false'
        ];
        
        // Ejecutar configuraciones
        for (const config of gitConfig) {
            try {
                await execAsync(config, { 
                    env: { ...process.env, GIT_PAGER: 'cat' },
                    timeout: 5000 
                });
            } catch (configErr) {
                console.log('Config warning:', configErr.message);
            }
        }
        
        // Hacer pull
        const { stdout, stderr } = await execAsync('git pull', {
            env: { 
                ...process.env, 
                GIT_PAGER: 'cat',
                GIT_TERMINAL_PROMPT: '0'
            },
            timeout: 30000
        });
        
        if (stderr && !stderr.includes('Already up to date')) {
            console.warn('⚠️ Advertencia:', stderr);
        }
        
        if (stdout.includes('Already up to date')) {
            conn.reply(m.chat, `🎃 *¡Ya estás malditamente actualizado!* 🔪\n\nNo hay cambios que absorber...`, m);
        } else {
            conn.reply(m.chat, `🕷️ *¡RITUAL COMPLETADO CON ÉXITO!* 🧛‍♀️\n\n🩸 Cambios absorbidos:\n\`\`\`${stdout.trim()}\`\`\``, m);
        }
        
    } catch (error) {
        // Si todo falla, intentar con fetch manual
        try {
            await execAsync('git fetch origin main', {
                env: { ...process.env, GIT_PAGER: 'cat' },
                timeout: 15000
            });
            
            await execAsync('git reset --hard origin/main', {
                env: { ...process.env, GIT_PAGER: 'cat' },
                timeout: 15000
            });
            
            conn.reply(m.chat, `🕷️ *¡RITUAL FORZADO COMPLETADO!* 🧛‍♀️\n\n🩸 Bot actualizado por la fuerza...`, m);
            
        } catch (forceError) {
            conn.reply(m.chat, `☠️ *ERROR EN EL RITUAL*\n\n💀 Razón: ${error.message}\n\n🧟‍♂️ Error de fuerza: ${forceError.message}`, m);
        }
    }
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix'];
handler.rowner = true;

export default handler;
