/** Tipos compartidos de imagen del dominio PaintNum. */

/** Color RGB en componentes discretas 0..255. */
export interface RgbColor {
  r: number
  g: number
  b: number
}

/** Imagen raster RGBA row-major (4 bytes por píxel, formato ImageData). */
export interface RasterImage {
  width: number
  height: number
  data: Uint8ClampedArray
}

/** Contrato mínimo usado por el núcleo puro (permite samples propios en pruebas). */
export interface ImageDataLike {
  width: number
  height: number
  data: ArrayLike<number>
}

/** Clave empaquetada de un color RGB en un entero. */
export const rgbKey = ({ r, g, b }: RgbColor): number =>
  (r << 16) | (g << 8) | b

/** HEX en minúscula con `#` (p. ej. `#0a84ff`). */
export const hexFrom = ({ r, g, b }: RgbColor): string =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
