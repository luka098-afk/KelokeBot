let handler = async (m, { conn }) => {
    try {
        m.reply(`🩸 *𝘼𝘾𝙏𝙄𝙑𝘼𝙉𝘿𝙊 𝙀𝙇 𝙍𝙄𝙏𝙐𝘼𝙇...* 🧟‍♂️\n\n☠️ 𝙍𝙚𝙞𝙣𝙞𝙘𝙞𝙖𝙣𝙙𝙤 𝙚𝙡 𝙗𝙤𝙩 𝙥𝙖𝙧𝙖 𝙖𝙥𝙡𝙞𝙘𝙖𝙧 𝙘𝙖𝙢𝙗𝙞𝙤𝙨...`);
        
        // Verificar que el bot puede reiniciarse
        if (!process || typeof process.exit !== 'function') {
            throw new Error('No se puede reiniciar el bot en este entorno');
        }
        
        // Timeout con manejo de errores
        const restartTimeout = setTimeout(() => {
            try {
                console.log('🔄 Reiniciando bot por comando .update');
                process.exit(1);
            } catch (exitError) {
                console.error('❌ Error al intentar reiniciar:', exitError.message);
                conn.reply(m.chat, `☠️ *ERROR EN EL RITUAL*\n\n💀 No se pudo reiniciar automáticamente\n🧟‍♂️ Reinicia manualmente el bot`, m);
            }
        }, 2000);
        
        // Limpiar timeout si algo sale mal
        setTimeout(() => {
            if (restartTimeout) {
                clearTimeout(restartTimeout);
                conn.reply(m.chat, `⚠️ *RITUAL CANCELADO*\n\n🕷️ Timeout de reinicio alcanzado`, m);
            }
        }, 5000);
        
    } catch (error) {
        console.error('❌ Error en comando update:', error.message);
        conn.reply(m.chat, `☠️ *ERROR EN EL RITUAL*\n\n💀 Razón: ${error.message}\n🧟‍♂️ Intenta reiniciar manualmente`, m);
    }
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'fix'];
handler.rowner = true;

export default handler;
