/** Fixtures sintéticas de imágenes para pruebas del núcleo puro (sin DOM). */

import type { ImageDataLike, RasterImage } from '@/interfaces/image'

/** Crea una imagen RGBA vacía. */
export function emptyImage(width: number, height: number): RasterImage {
  return {
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
  }
}

/** Las fixtures escriben RGBA directamente; el núcleo solo lee (ImageDataLike). */
type WritableImage = RasterImage & ImageDataLike

/** Pinta un rectángulo sólido opaco. */
export function fillRect(
  image: WritableImage,
  x: number,
  y: number,
  w: number,
  h: number,
  color: { r: number; g: number; b: number },
): void {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      const o = (yy * image.width + xx) * 4
      image.data[o] = color.r
      image.data[o + 1] = color.g
      image.data[o + 2] = color.b
      image.data[o + 3] = 255
    }
  }
}

/** 2x1: rojo a la izquierda, azul a la derecha. */
export function solidSplitImage(): ImageDataLike {
  const image = emptyImage(4, 2)
  fillRect(image, 0, 0, 2, 2, { r: 220, g: 30, b: 30 })
  fillRect(image, 2, 0, 2, 2, { r: 30, g: 40, b: 220 })
  return image
}

/** Imagen ruidosa gradual para ejercitar cuantización y regiones. */
export function noisyGradientImage(width = 36, height = 24): ImageDataLike {
  const image = emptyImage(width, height)
  let seed = 42
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4
      const t = x / (width - 1)
      image.data[o] = Math.round(60 + 150 * t + (rand() - 0.5) * 24)
      image.data[o + 1] = Math.round(30 + 90 * (1 - t) + (rand() - 0.5) * 24)
      image.data[o + 2] = Math.round(90 + (rand() - 0.5) * 24)
      image.data[o + 3] = 255
    }
  }
  return image
}
