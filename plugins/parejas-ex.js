import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const exparejasPath = path.join('./database', 'exparejas.json')
    const parejasPath = path.join('./database', 'parejas.json')

    let exparejas = {}
    let parejas = {}

    // Leer archivos
    try {
      if (fs.existsSync(exparejasPath)) {
        exparejas = JSON.parse(fs.readFileSync(exparejasPath))
      }
    } catch (e) {
      exparejas = {}
    }

    try {
      if (fs.existsSync(parejasPath)) {
        parejas = JSON.parse(fs.readFileSync(parejasPath))
      }
    } catch (e) {
      parejas = {}
    }

    // Usuario que ejecuta el comando
    const userJID = m.sender // Su JID real del grupo
    const userNumber = userJID.split('@')[0]

    console.log('=== USUARIO ===')
    console.log('User JID real:', userJID)
    console.log('User Number:', userNumber)

    // Función para extraer solo el número
    const extractNumber = (jid) => {
      return jid.toString().split('@')[0].replace(/\D/g, '')
    }

    const userCleanNumber = extractNumber(userJID)
    
    console.log('User Clean Number:', userCleanNumber)
    console.log('Claves en exparejas:', Object.keys(exparejas))
    console.log('Claves en parejas:', Object.keys(parejas))

    // Arrays de resultados
    const exParejasFound = []
    const parejaActualFound = []

    // === BUSCAR EX PAREJAS ===
    console.log('\n=== BUSCANDO EX PAREJAS ===')
    
    for (const [key, data] of Object.entries(exparejas)) {
      const keyNumber = extractNumber(key)
      console.log(`Checking exparejas key: ${key} -> number: ${keyNumber}`)
      
      // Comparar números limpios
      if (keyNumber === userCleanNumber) {
        console.log('✅ MATCH! Usuario encontrado en exparejas')
        
        if (data && data.ex) {
          const exJID = data.ex // Usar el JID EXACTO de la base de datos
          const exNumber = extractNumber(exJID)
          
          console.log(`Ex JID original (exacto): ${exJID}`)
          console.log(`Ex number: ${exNumber}`)
          
          // Verificar que la ex no sea el mismo usuario
          if (exNumber !== userCleanNumber) {
            exParejasFound.push({
              jid: exJID, // JID EXACTO de la base de datos
              number: exNumber
            })
            console.log('✅ Ex pareja agregada con JID exacto')
          } else {
            console.log('❌ Ex pareja es el mismo usuario, ignorada')
          }
        }
      }
    }

    // === BUSCAR PAREJA ACTUAL ===
    console.log('\n=== BUSCANDO PAREJA ACTUAL ===')
    
    // Método 1: Buscar por número directo en parejas.json
    console.log(`Buscando clave directa: "${userCleanNumber}"`)
    
    if (parejas[userCleanNumber] && parejas[userCleanNumber].pareja) {
      const parejaData = parejas[userCleanNumber]
      const parejaJID = parejaData.pareja // JID EXACTO de la base de datos
      const parejaNumber = extractNumber(parejaJID)
      
      console.log(`Pareja encontrada método 1:`)
      console.log(`  JID exacto: ${parejaJID}`)
      console.log(`  Number: ${parejaNumber}`)
      
      if (parejaNumber !== userCleanNumber) {
        parejaActualFound.push({
          jid: parejaJID, // JID EXACTO de la base de datos
          number: parejaNumber
        })
        console.log('✅ Pareja actual agregada (método 1) con JID exacto')
      }
    } else {
      console.log('❌ No encontrado con método 1')
    }

    // Método 2: Buscar donde el usuario sea el valor de "pareja"
    if (parejaActualFound.length === 0) {
      console.log('Probando método 2...')
      
      for (const [key, data] of Object.entries(parejas)) {
        if (data && data.pareja) {
          const parejaInDataNumber = extractNumber(data.pareja)
          console.log(`Checking si ${data.pareja} (${parejaInDataNumber}) es usuario (${userCleanNumber})`)
          
          if (parejaInDataNumber === userCleanNumber) {
            console.log('✅ Usuario es pareja de esta entrada')
            
            const keyNumber = extractNumber(key)
            // Para método 2, la clave podría ser solo número, necesito construir el JID
            let keyJID = key
            if (!key.includes('@')) {
              // Si es solo número, necesito averiguar el JID correcto
              // Buscar en exparejas para ver el formato de JID de esta persona
              let foundJID = null
              for (const [exKey, exData] of Object.entries(exparejas)) {
                const exKeyNumber = extractNumber(exKey)
                if (exKeyNumber === keyNumber) {
                  foundJID = exKey
                  break
                }
              }
              keyJID = foundJID || `${keyNumber}@lid` // Default a @lid si no se encuentra
            }
            
            console.log(`Pareja encontrada método 2:`)
            console.log(`  Key original: ${key}`)
            console.log(`  JID construido: ${keyJID}`)
            console.log(`  Number: ${keyNumber}`)
            
            if (keyNumber !== userCleanNumber) {
              parejaActualFound.push({
                jid: keyJID,
                number: keyNumber
              })
              console.log('✅ Pareja actual agregada (método 2)')
              break
            }
          }
        }
      }
    }

    console.log('\n=== RESULTADOS ===')
    console.log(`Ex parejas encontradas: ${exParejasFound.length}`)
    console.log(`Pareja actual encontrada: ${parejaActualFound.length}`)

    // Mostrar detalles
    exParejasFound.forEach((ex, i) => {
      console.log(`Ex ${i + 1}: JID=${ex.jid}, Number=${ex.number}`)
    })
    parejaActualFound.forEach((pareja, i) => {
      console.log(`Pareja ${i + 1}: JID=${pareja.jid}, Number=${pareja.number}`)
    })

    // === CONSTRUIR MENSAJE ===
    let mensaje = ''
    const mentionsArray = []

    // Agregar ex parejas
    if (exParejasFound.length > 0) {
      const exMentions = exParejasFound.map(ex => `@${ex.number}`).join(', ')
      mensaje += `💔 **Ex parejas:** ${exMentions}\n\n`
      
      // Usar JIDs EXACTOS para las menciones
      exParejasFound.forEach(ex => {
        mentionsArray.push(ex.jid)
      })
    }

    // Agregar pareja actual
    if (parejaActualFound.length > 0) {
      const pareja = parejaActualFound[0]
      mensaje += `💕 **Pareja actual:** @${pareja.number}`
      
      // Usar JID EXACTO para la mención
      mentionsArray.push(pareja.jid)
    } else {
      mensaje += `💔 **Pareja actual:** No tiene 💔`
    }

    // Casos especiales
    if (exParejasFound.length === 0 && parejaActualFound.length === 0) {
      return m.reply('💔 No tienes ex parejas ni pareja actual registradas. ¡Sal ahí fuera y encuentra el amor! 💕')
    }

    if (exParejasFound.length === 0 && parejaActualFound.length > 0) {
      const pareja = parejaActualFound[0]
      mensaje = `💕 **Pareja actual:** @${pareja.number}\n\n🤷‍♂️ No tienes ex parejas registradas.`
    }

    console.log('\n=== MENSAJE FINAL ===')
    console.log('Texto:')
    console.log(mensaje)
    console.log('Mentions array (JIDs exactos):')
    console.log(mentionsArray)

    // === ENVIAR MENSAJE ===
    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: mentionsArray
    })

    console.log('✅ Mensaje enviado con JIDs exactos')

  } catch (error) {
    console.error('❌ Error en .ex:', error)
    m.reply('❌ Ocurrió un error al consultar tus relaciones.')
  }
}

handler.help = ['ex']
handler.tags = ['fun']
handler.command = /^ex$/i

export default handler
