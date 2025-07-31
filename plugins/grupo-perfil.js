import { proto, generateWAMessageContent, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo está disponible en grupos.')

  // Determinar el usuario objetivo y formatear correctamente el JID
  let targetUser
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    targetUser = m.mentionedJid[0]
  } else {
    targetUser = m.sender
  }

  // Asegurar formato JID correcto
  const userJid = targetUser.includes('@') ? targetUser : `${targetUser}@s.whatsapp.net`
  
  const username = await conn.getName(userJid)
  const number = userJid.split('@')[0]
  const isRegistered = global.db.data.users[userJid]?.registered ? '✅ Registrado' : '❌ No registrado'

  // Obtener foto de perfil o usar imagen por defecto
  let profilePicUrl
  try {
    profilePicUrl = await conn.profilePictureUrl(userJid, 'image')
  } catch (e) {
    profilePicUrl = 'http://imgfz.com/i/JkN0gqv.jpeg' // Imagen por defecto
  }

  const { imageMessage } = await generateWAMessageContent({
    image: { url: profilePicUrl }
  }, { upload: conn.waUploadToServer })

  const card = {
    body: proto.Message.InteractiveMessage.Body.fromObject({
      text: `👤 *Perfil de Usuario*\n\n📛 Nombre: ${username}\n📱 Número: wa.me/${number}\n📝 Registro: ${isRegistered}`
    }),
    footer: proto.Message.InteractiveMessage.Footer.fromObject({
      text: 'Bot: kelokebot'
    }),
    header: proto.Message.InteractiveMessage.Header.fromObject({
      hasMediaAttachment: true,
      imageMessage
    }),
    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
      buttons: [
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '📢 Canal de WhatsApp',
            url: 'https://whatsapp.com/channel/0029VawwvsW7j6g1upS0i531'
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '🎵 TikTok del Creador',
            url: 'https://www.tiktok.com/@elgerman0?_t=ZM-8yMelASBfdw&_r=1'
          })
        }
      ]
    })
  }

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: '✨ Información de perfil'
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: 'Sistema de Perfiles • kelokebot'
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards: [card]
          })
        })
      }
    }
  }, {})

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  await m.react('👤')
}

handler.help = ['perfil', 'verperfil']
handler.tags = ['info']
handler.command = ['perfil', 'verperfil', 'profile']

export default handler
