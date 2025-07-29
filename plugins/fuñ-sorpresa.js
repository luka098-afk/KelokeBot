let handler = async (m, { conn, isOwner, isAdmin }) => {
  let mensajesOwner = [
    '🔥 ¡Hola Owner! Eres el jefe supremo del bot.',
    '👑 El poder está en tus manos, Owner.',
    '🚀 Owner, prepárate para conquistar el mundo.',
  ]

  let mensajesAdmin = [
    '⚔️ Admin, ¡mantén el orden en el grupo!',
    '🛡️ Admin, gracias por proteger el grupo.',
    '🎯 Admin, eres la primera línea de defensa.',
  ]

  let mensajesUser = [
    '😄 Hola participante, ¡diviértete!',
    '🎉 Participante, ¡hoy es tu día de suerte!',
    '🤖 Participante, el bot te saluda con alegría.',
  ]

  let msg

  if (isOwner) {
    msg = mensajesOwner[Math.floor(Math.random() * mensajesOwner.length)]
  } else if (isAdmin) {
    msg = mensajesAdmin[Math.floor(Math.random() * mensajesAdmin.length)]
  } else {
    msg = mensajesUser[Math.floor(Math.random() * mensajesUser.length)]
  }

  await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
}

handler.command = /^sorpresa$/i
handler.group = false // Puede usarse en privado o grupo
export default handler
