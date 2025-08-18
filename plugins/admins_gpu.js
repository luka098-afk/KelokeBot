import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command, isAdmin }) => {
  // Verificar si el usuario es admin
  if (m.isGroup && !isAdmin) {
    return conn.reply(m.chat, `🔒 *Solo administradores pueden usar este comando*`, m);
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '🖼️', key: m.key } });

    let targetUser = null;
    let userName = 'Usuario';

    // Determinar el usuario objetivo
    if (m.quoted) {
      // Si se citó un mensaje
      targetUser = m.quoted.sender;
      userName = m.quoted.pushName || m.quoted.sender.split('@')[0] || 'Usuario';
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      // Si se mencionó a alguien
      targetUser = m.mentionedJid[0];
      userName = targetUser.split('@')[0] || 'Usuario';
    } else {
      // Si no hay mención ni cita, usar el remitente del comando
      targetUser = m.sender;
      userName = m.pushName || m.sender.split('@')[0] || 'Usuario';
    }



    // Intentar obtener la foto de perfil
    let profilePicUrl = null;
    let profileBuffer = null;

    try {
      // Método 1: Obtener URL de foto de perfil de alta resolución
      profilePicUrl = await conn.profilePictureUrl(targetUser, 'image');
      
      if (profilePicUrl) {
        // Descargar la imagen
        const response = await fetch(profilePicUrl);
        if (response.ok) {
          profileBuffer = await response.buffer();
        }
      }
    } catch (error) {
      console.log('Error obteniendo foto de alta resolución:', error.message);
      
      // Método 2: Intentar obtener foto de baja resolución
      try {
        profilePicUrl = await conn.profilePictureUrl(targetUser, 'preview');
        if (profilePicUrl) {
          const response = await fetch(profilePicUrl);
          if (response.ok) {
            profileBuffer = await response.buffer();
          }
        }
      } catch (error2) {
        console.log('Error obteniendo foto de baja resolución:', error2.message);
      }
    }

    if (profileBuffer && profileBuffer.length > 0) {
      // Enviar solo la foto sin texto
      await conn.sendMessage(m.chat, {
        image: profileBuffer
      }, { quoted: m });

    } else {
      // Mensaje simple cuando no hay foto
      await conn.reply(m.chat, `❌ *${userName}* no tiene foto visible para todos`, m);
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('❌ Error en gpu:', error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    
    return conn.reply(m.chat, `❌ *Error al obtener foto de perfil*`, m);
  }
};

// Función auxiliar para obtener información del usuario
async function getUserInfo(conn, userId) {
  try {
    const userInfo = {
      id: userId,
      name: userId.split('@')[0],
      hasPhoto: false,
      photoUrl: null
    };

    // Intentar obtener información adicional si es posible
    try {
      const metadata = await conn.groupMetadata(userId);
      if (metadata) {
        userInfo.name = metadata.subject || userInfo.name;
      }
    } catch (e) {
      // No es un grupo, continuar
    }

    return userInfo;
  } catch (error) {
    return {
      id: userId,
      name: userId.split('@')[0] || 'Usuario',
      hasPhoto: false,
      photoUrl: null
    };
  }
}

handler.command = ['gpu'];
handler.tags = ['tools'];
handler.help = ['gpu'];
handler.register = true;

export default handler;
