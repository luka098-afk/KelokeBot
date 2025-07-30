let handler = async (m, { conn }) => {
    // LÍNEA DE DEBUG - Para verificar qué versión está ejecutando
    m.reply(`🔍 *VERSIÓN DE DEBUG* 🔍\n\n📅 Timestamp: ${new Date().toISOString()}\n🆔 Versión: DEBUG_2024_v2\n\n🩸 *𝘼𝘾𝙏𝙄𝙑𝘼𝙉𝘿𝙊 𝙀𝙇 𝙍𝙄𝙏𝙐𝘼𝙇...* 🧟‍♂️\n\n☠️ 𝙍𝙚𝙞𝙣𝙞𝙘𝙞𝙖𝙣𝙙𝙤 𝙚𝙡 𝙗𝙤𝙩 (SIN GIT)...`);
    
    try {
        // SIN GIT - Solo reinicio
        setTimeout(() => {
            console.log('🔄 Reiniciando bot - versión sin git');
            process.exit(1);
        }, 3000);
        
    } catch (error) {
        m.reply(`☠️ *ERROR EN EL RITUAL*\n\n💀 Razón: ${error.message}`, m);
    }
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix'];
handler.rowner = true;

export default handler;
