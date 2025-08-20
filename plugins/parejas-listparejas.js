import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const parejasPath = path.join('./database', 'parejas.json')
    const casadosPath = path.join('./database', 'casados.json')
    const exparejasPath = path.join('./database', 'exparejas.json')

    let parejas = {}
    let casados = {}
    let exparejas = {}

    // Leer archivos
    try {
      if (fs.existsSync(parejasPath)) {
        parejas = JSON.parse(fs.readFileSync(parejasPath))
      }
    } catch (e) {
      parejas = {}
    }

    try {
      if (fs.existsSync(casadosPath)) {
        casados = JSON.parse(fs.readFileSync(casadosPath))
      }
    } catch (e) {
      casados = {}
    }

    // Leer exparejas para conocer el formato JID real de los usuarios
    try {
      if (fs.existsSync(exparejasPath)) {
        exparejas = JSON.parse(fs.readFileSync(exparejasPath))
      }
    } catch (e) {
      exparejas = {}
    }

    console.log('=== LISTANDO PAREJAS ===')
    console.log('Claves en parejas:', Object.keys(parejas))
    console.log('Claves en casados:', Object.keys(casados))
    console.log('Claves en exparejas:', Object.keys(exparejas))

    // Función para extraer número limpio
    const extractNumber = (jid) => {
      return jid.toString().split('@')[0].replace(/\D/g, '')
    }

    // Función para encontrar el JID real de una persona en el grupo
    const findRealJID = (number) => {
      const cleanNumber = extractNumber(number)

      // Buscar primero en exparejas (que tiene los JIDs reales del grupo)
      for (const [key, data] of Object.entries(exparejas)) {
        const keyNumber = extractNumber(key)
        if (keyNumber === cleanNumber) {
          console.log(`JID real encontrado en exparejas: ${number} -> ${key}`)
          return key
        }
      }

      // Si no se encuentra en exparejas, usar formato @lid por defecto
      const defaultJID = `${cleanNumber}@lid`
      console.log(`JID real no encontrado, usando default: ${number} -> ${defaultJID}`)
      return defaultJID
    }

    // Función para calcular tiempo de relación
    const calcularTiempoRelacion = (fechaInicio) => {
      if (!fechaInicio) return 'Tiempo desconocido'

      const inicio = new Date(fechaInicio)
      const ahora = new Date()
      const diferencia = ahora - inicio

      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
      const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))

      if (dias > 0) {
        return `${dias} día${dias !== 1 ? 's' : ''}`
      } else if (horas > 0) {
        return `${horas} hora${horas !== 1 ? 's' : ''}`
      } else {
        return `${minutos} minuto${minutos !== 1 ? 's' : ''}`
      }
    }

    // ✅ Función para verificar si están casados según la estructura real de casados.json
    const estanCasados = (numero1, numero2) => {
      const num1 = extractNumber(numero1)
      const num2 = extractNumber(numero2)

      for (const [_, registros] of Object.entries(casados)) {
        if (Array.isArray(registros)) {
          for (const reg of registros) {
            const a = extractNumber(reg.jid)
            const b = extractNumber(reg.targetJid)
            const okEstado = (reg.estado || '').toLowerCase() === 'casados'
            if (okEstado && (
              (a === num1 && b === num2) ||
              (a === num2 && b === num1)
            )) {
              return true
            }
          }
        }
      }
      return false
    }

    // Recopilar todas las parejas
    const parejasEncontradas = []
    const parejasYaProcesadas = new Set()

    console.log('\n=== PROCESANDO PAREJAS ===')

    for (const [key, data] of Object.entries(parejas)) {
      if (data && data.pareja) {
        const keyNumber = extractNumber(key)
        const parejaOriginalJID = data.pareja
        const parejaNumber = extractNumber(parejaOriginalJID)

        console.log(`\nProcesando entrada: ${key} -> pareja: ${parejaOriginalJID}`)
        console.log(`Numbers: ${keyNumber} -> ${parejaNumber}`)

        // Crear clave única para evitar duplicados
        const parejaKey = [keyNumber, parejaNumber].sort().join('-')

        if (!parejasYaProcesadas.has(parejaKey)) {
          // Encontrar JIDs reales para ambas personas
          const persona1RealJID = findRealJID(keyNumber)
          const persona2RealJID = findRealJID(parejaNumber)

          console.log(`JID real persona1: ${keyNumber} -> ${persona1RealJID}`)
          console.log(`JID real persona2: ${parejaNumber} -> ${persona2RealJID}`)

          const casadosFlag = estanCasados(keyNumber, parejaNumber)
          const tiempoJuntos = calcularTiempoRelacion(data.desde)

          parejasEncontradas.push({
            persona1: {
              jid: persona1RealJID, // JID REAL del grupo
              number: keyNumber
            },
            persona2: {
              jid: persona2RealJID, // JID REAL del grupo
              number: parejaNumber
            },
            desde: data.desde,
            tiempoJuntos: tiempoJuntos,
            casados: casadosFlag
          })

          parejasYaProcesadas.add(parejaKey)

          console.log(`✅ Pareja agregada: ${persona1RealJID} + ${persona2RealJID}`)
          console.log(`   Casados: ${casadosFlag}, Tiempo: ${tiempoJuntos}`)
        } else {
          console.log(`❌ Pareja ya procesada: ${parejaKey}`)
        }
      }
    }

    console.log(`\nTotal parejas encontradas: ${parejasEncontradas.length}`)

    // Verificar si hay parejas
    if (parejasEncontradas.length === 0) {
      return m.reply('💔 No hay parejas registradas en este momento.\n\n¡Anímense a declararse! 💕')
    }

    // Construir mensaje (solo formateo: "Novios" y debajo "Casados? Sí/No")
    let mensaje = `💕 **LISTA DE NOVIOS** 💕\n\n`
    const mentionsArray = [] // Array de JIDs REALES para menciones

    // Ordenar parejas por tiempo de relación (más antiguas primero)
    const parejasOrdenadas = parejasEncontradas.sort((a, b) => {
      if (!a.desde && !b.desde) return 0
      if (!a.desde) return 1
      if (!b.desde) return -1
      return new Date(a.desde) - new Date(b.desde)
    })

    let contador = 1

    for (const pareja of parejasOrdenadas) {
      mensaje += `${contador}. @${pareja.persona1.number} 💕 @${pareja.persona2.number}\n`
      mensaje += `   Novios • ${pareja.tiempoJuntos}\n`
      mensaje += `   Casados? ${pareja.casados ? 'Sí ✅' : 'No ❌'}\n\n`

      // Agregar JIDs REALES para menciones
      mentionsArray.push(pareja.persona1.jid)
      mentionsArray.push(pareja.persona2.jid)

      console.log(`Pareja ${contador}: ${pareja.persona1.jid} + ${pareja.persona2.jid}`)

      contador++
    }

    // Estadísticas al final (incluye cuántos casados)
    const totalParejas = parejasOrdenadas.length
    const parejasCasadas = parejasOrdenadas.filter(p => p.casados).length
    const parejasNoviazgo = totalParejas - parejasCasadas

    mensaje += `📊 **ESTADÍSTICAS**\n`
    mensaje += `Total parejas: ${totalParejas}\n`
    mensaje += `💕 Novios: ${parejasNoviazgo}\n`
    mensaje += `💍 Casados: ${parejasCasadas}\n\n`
    mensaje += `_¡El amor está en el aire! 💖_`

    console.log('\n=== MENSAJE FINAL ===')
    console.log('Texto del mensaje:')
    console.log(mensaje)
    console.log('\nMentions array (JIDs reales):')
    console.log(mentionsArray)
    console.log(`Total menciones: ${mentionsArray.length}`)

    // Enviar mensaje con JIDs REALES
    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: mentionsArray
    })

    console.log('✅ Lista de parejas enviada con JIDs reales')

  } catch (error) {
    console.error('❌ Error en .listparejas:', error)
    console.error('Stack trace:', error.stack)
    m.reply('❌ Ocurrió un error al obtener la lista de parejas.')
  }
}

handler.help = ['listparejas']
handler.tags = ['pareja']
handler.command = /^listparejas$/i

export default handler
