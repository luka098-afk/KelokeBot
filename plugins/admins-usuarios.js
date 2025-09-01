import fs from 'fs'
import path from 'path'

// === RUTAS Y SETUP ===
const DB_DIR = path.join(process.cwd(), 'database')
const USUARIOS_FILE = path.join(DB_DIR, 'usuarios.json')

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
if (!fs.existsSync(USUARIOS_FILE)) fs.writeFileSync(USUARIOS_FILE, JSON.stringify({}, null, 2))

// === UTILIDADES JSON ===
function leerDatos() {
  try {
    const raw = fs.readFileSync(USUARIOS_FILE, 'utf8')
    return JSON.parse(raw || '{}')
  } catch (e) {
    console.error('[usuarios] Error leyendo JSON:', e)
    return {}
  }
}

function guardarDatos(data) {
  try {
    const tmp = USUARIOS_FILE + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
    fs.renameSync(tmp, USUARIOS_FILE)
    return true
  } catch (e) {
    console.error('[usuarios] Error guardando JSON:', e)
    return false
  }
}

// === HANDLER PRINCIPAL ===
const handler = async (m, { conn, text, isAdmin }) => {
  const channelRD = global.channelRD || { id: '120363386229166956@newsletter', name: 'Canal Oficial' }

  const ctxInfo = (mentions = []) => ({
    mentionedJid: mentions,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelRD.id,
      serverMessageId: 100,
      newsletterName: channelRD.name
    }
  })

  if (!isAdmin) return conn.sendMessage(m.chat, {
    text: '🔒 *Solo administradores pueden usar este comando*',
    contextInfo: ctxInfo([m.sender])
  }, { quoted: m })

  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: '❌ *Este comando solo funciona en grupos*',
    contextInfo: ctxInfo([m.sender])
  }, { quoted: m })

  const chatId = m.chat
  const datos = leerDatos()
  const arg = (text || '').trim().toLowerCase()

  try {
    if (!arg) {
      if (!datos[chatId] || !datos[chatId].activo)
        return conn.sendMessage(m.chat, {
          text: '⚠️ *El conteo de mensajes está desactivado en este grupo*\n\nUsa: *.usuarios on*',
          contextInfo: ctxInfo([m.sender])
        }, { quoted: m })

      const meta = await conn.groupMetadata(chatId)
      const miembros = meta.participants.map(p => p.id)
      const usuariosData = datos[chatId].usuarios || {}

      let mensaje = '📊 *Mensajes de todos los miembros del grupo*\n\n'
      const mentions = []

      const hablaron = []
      const noHablaron = []

      for (const userId of miembros) {
        const cantidad = usuariosData[userId] || 0
        if (cantidad > 0) {
          hablaron.push({ userId, cantidad })
        } else {
          noHablaron.push({ userId, cantidad })
        }
      }

      hablaron.sort((a, b) => b.cantidad - a.cantidad)

      for (const u of hablaron) {
        mensaje += `🟢 @${u.userId.split('@')[0]}: ${u.cantidad} mensajes\n`
        mentions.push(u.userId)
      }

      for (const u of noHablaron) {
        mensaje += `⚪ @${u.userId.split('@')[0]}: ${u.cantidad} mensajes\n`
        mentions.push(u.userId)
      }

      mensaje += `\n⏰ *Último update:* ${new Date().toLocaleString('es-UY')}`

      await conn.sendMessage(m.chat, {
        text: mensaje,
        mentions,
        contextInfo: ctxInfo(mentions)
      }, { quoted: m })

    } else if (arg === 'on') {
      if (!datos[chatId]) datos[chatId] = { activo: false, usuarios: {} }
      if (datos[chatId].activo) return conn.sendMessage(m.chat, {
        text: '✅ *El conteo de mensajes ya está activado*',
        contextInfo: ctxInfo([m.sender])
      }, { quoted: m })

      datos[chatId].activo = true
      guardarDatos(datos)

      await conn.sendMessage(m.chat, {
        text: '✅ *Conteo de mensajes activado*\n\nAhora se contarán todos los mensajes del grupo.',
        contextInfo: ctxInfo([m.sender])
      }, { quoted: m })

    } else if (arg === 'off') {
      if (!datos[chatId] || !datos[chatId].activo)
        return conn.sendMessage(m.chat, {
          text: '⚠️ *El conteo de mensajes ya está desactivado*',
          contextInfo: ctxInfo([m.sender])
        }, { quoted: m })

      datos[chatId].activo = false
      guardarDatos(datos)

      await conn.sendMessage(m.chat, {
        text: '❌ *Conteo de mensajes desactivado*\n\nLos datos existentes se mantienen.',
        contextInfo: ctxInfo([m.sender])
      }, { quoted: m })

    } else {
      return conn.sendMessage(m.chat, {
        text: '❌ *Comando inválido*\n\n' +
              '📋 *Uso correcto:*\n' +
              '• *.usuarios* — Ver todos los miembros y mensajes\n' +
              '• *.usuarios on* — Activar conteo\n' +
              '• *.usuarios off* — Desactivar conteo',
        contextInfo: ctxInfo([m.sender])
      }, { quoted: m })
    }

  } catch (e) {
    console.error('[usuarios] Error en comando:', e)
    await conn.sendMessage(m.chat, {
      text: '❌ *Error al procesar el comando*',
      contextInfo: ctxInfo([m.sender])
    }, { quoted: m })
  }
}

// === METADATOS DEL COMANDO (RoxyBot) ===
handler.help = ['usuarios']
handler.tags = ['group']
handler.command = /^usuarios$/i
handler.group = true
handler.admin = true
handler.register = true

// === LISTENER GLOBAL PARA CONTAR MENSAJES ===
handler.all = async function (m) {
  try {
    if (!m.isGroup) return
    if (m.fromMe) return

    const txt = (m.text || '').trim()
    if (txt && /^([./!#?$%&*~+=><-])/.test(txt)) return
    if (!m.text && !m.caption) return

    const chatId = m.chat
    const userId = m.sender

    const datos = leerDatos()
    if (!datos[chatId] || !datos[chatId].activo) return

    if (!datos[chatId].usuarios) datos[chatId].usuarios = {}
    if (!datos[chatId].usuarios[userId]) datos[chatId].usuarios[userId] = 0

    datos[chatId].usuarios[userId] += 1
    guardarDatos(datos)
  } catch (e) {
    console.error('[usuarios] Error contando mensaje:', e)
  }
}

export default handler
