import sharp from 'sharp'
import axios from 'axios'

export async function sticker(bufferImg = false, urlImg = false) {
  try {
    let imageBuffer

    if (bufferImg) {
      imageBuffer = bufferImg
    } else if (urlImg) {
      const response = await axios.get(urlImg, { responseType: 'arraybuffer' })
      imageBuffer = Buffer.from(response.data, 'utf-8')
    } else {
      throw new Error('No image data provided')
    }

    // Procesar a 512x512 con fondo transparente y calidad menor para menor peso
    const outputBuffer = await sharp(imageBuffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({
        quality: 70,       // Calidad más baja para menos peso
        lossless: false,   // No usar lossless para menor tamaño
        effort: 4,         // Tiempo de compresión equilibrado
      })
      .toBuffer()

    return outputBuffer
  } catch (error) {
    console.error('Error creating sticker:', error)
    throw error
  }
}
