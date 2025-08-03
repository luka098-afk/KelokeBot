import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
  try {
    const parejasPath = path.join('./database', 'parejas.json')
    const casadosPath = path.join('./database', 'casados.json')

    let parejas = {}
    let casados = {}

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

    console.log('=== LISTANDO PAREJAS ===')
    console.log('Parejas encontradas:', Object.keys(parejas).length)
    console.log('Casados encontrados:', Object.keys(casados).length)

    // Función para extraer número limpio
    const extractNumber = (jid) => {
      return jid.toString().split('@')[0].replace(/\D/g, '')
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

    // Función para verificar si están casados
    const estanCasados = (numero1, numero2) => {
      const num1 = extractNumber(numero1)
      const num2 = extractNumber(numero2)
      
      // Verificar en ambas direcciones
      for (const [key, data] of Object.entries(casados)) {
        if (data && data.pareja) {
          const keyNum = extractNumber(key)
          const parejaNum = extractNumber(data.pareja)
          
          if ((keyNum === num1 && parejaNum === num2) || 
              (keyNum === num2 && parejaNum === num1)) {
            return true
          }
        }
      }
      return false
    }

    // Recopilar todas las parejas únicas
    const parejasUnicas = new Map()
    
    for (const [key, data] of Object.entries(parejas)) {
      if (data && data.pareja) {
        const keyNumber = extractNumber(key)
        const parejaNumber = extractNumber(data.pareja)
        
        // Crear una clave única ordenada para evitar duplicados
        const parejaKey = [keyNumber, parejaNumber].sort().join('-')
        
        if (!parejasUnicas.has(parejaKey)) {
          // Buscar el JID completo de ambos
          let keyJID = key.includes('@') ? key : `${keyNumber}@lid`
          let parejaJID = data.pareja
          
          const casados = estanCasados(keyNumber, parejaNumber)
          const tiempoJuntos = calcularTiempoRelacion(data.desde)
          
          parejasUnicas.set(parejaKey, {
            persona1: {
              jid: keyJID,
              number: keyNumber
            },
            persona2: {
              jid: parejaJID,
              number: parejaNumber
            },
            desde: data.desde,
            tiempoJuntos: tiempoJuntos,
            casados: casados
          })
          
          console.log(`Pareja encontrada: ${keyNumber} + ${parejaNumber}, Casados: ${casados}, Tiempo: ${tiempoJuntos}`)
        }
      }
    }

    console.log(`Total parejas únicas: ${parejasUnicas.size}`)

    // Construir mensaje
    if (parejasUnicas.size === 0) {
      return m.reply('💔 No hay parejas registradas en este momento.\n\n¡Anímense a declararse! 💕')
    }

    let mensaje = `💕 **LISTA DE PAREJAS ACTUALES** 💕\n\n`
    const mentionsArray = []
    let contador = 1

    // Ordenar parejas por tiempo de relación (más antiguas primero)
    const parejasOrdenadas = Array.from(parejasUnicas.values()).sort((a, b) => {
      if (!a.desde && !b.desde) return 0
      if (!a.desde) return 1
      if (!b.desde) return -1
      return new Date(a.desde) - new Date(b.desde)
    })

    for (const pareja of parejasOrdenadas) {
      const estadoCivil = pareja.casados ? '💍 Casados' : '💕 Novios'
      
      mensaje += `${contador}. @${pareja.persona1.number} 💕 @${pareja.persona2.number}\n`
      mensaje += `   ${estadoCivil} • ${pareja.tiempoJuntos}\n\n`
      
      // Agregar JIDs para menciones
      mentionsArray.push(pareja.persona1.jid, pareja.persona2.jid)
      contador++
    }

    // Estadísticas al final
    const totalParejas = parejasOrdenadas.length
    const parejasNoviazgo = parejasOrdenadas.filter(p => !p.casados).length
    const parejasCasadas = parejasOrdenadas.filter(p => p.casados).length
    
    mensaje += `📊 **ESTADÍSTICAS**\n`
    mensaje += `Total parejas: ${totalParejas}\n`
    mensaje += `💕 En noviazgo: ${parejasNoviazgo}\n`
    mensaje += `💍 Casadas: ${parejasCasadas}\n\n`
    mensaje += `_¡El amor está en el aire! 💖_`

    console.log('\n=== MENSAJE FINAL ===')
    console.log('Total menciones:', mentionsArray.length)
    console.log('Mentions:', mentionsArray)

    // Enviar mensaje
    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: mentionsArray
    })

    console.log('✅ Lista de parejas enviada exitosamente')

  } catch (error) {
    console.error('❌ Error en .listparejas:', error)
    m.reply('❌ Ocurrió un error al obtener la lista de parejas.')
  }
}

handler.help = ['listparejas']
handler.tags = ['pareja']
handler.command = /^listparejas$/i

export default handler
