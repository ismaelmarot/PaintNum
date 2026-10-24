/** Tipos de carga de imágenes del usuario. */

import type { RasterImage } from '@/interfaces/image'

export type LoadImageErrorKind = 'type' | 'size' | 'process'

export interface LoadLimits {
  maxFileBytes: number
  acceptedMimeTypes: readonly string[]
  maxWorkSide: number
}

export interface DecodedImage {
  /** ObjctURL del archivo original para previsualización y ZIP. */
  originalUrl: string
  /** Datos de la imagen a escala de trabajo (≤ maxWorkSide). */
  work: RasterImage
  naturalWidth: number
  naturalHeight: number
  /** Bitmap para reescalados posteriores (exports, PDF, comparador). */
  bitmap: ImageBitmap
}
