/** Carga y validación de imágenes del usuario. Todo local, nada sube a servidores. */

import type { DecodedImage, LoadImageErrorKind, LoadLimits } from '@/interfaces/loading'
import { axesDims } from '@/utils/imageProcessing/dims'

export class LoadImageError extends Error {
  readonly kind: LoadImageErrorKind
  constructor(kind: LoadImageErrorKind, message: string) {
    super(message)
    this.name = 'LoadImageError'
    this.kind = kind
  }
}

/** Validación pura (testeable sin DOM). */
export function validateImageFile(
  file: Pick<File, 'type' | 'size'>,
  limits: LoadLimits,
): void {
  if (!limits.acceptedMimeTypes.includes(file.type)) {
    throw new LoadImageError(
      'type',
      'Formato no compatible. Usá PNG, JPEG o WebP.',
    )
  }
  if (file.size > limits.maxFileBytes) {
    throw new LoadImageError(
      'size',
      `El archivo supera el límite de ${(limits.maxFileBytes / (1024 * 1024)).toFixed(0)} MB.`,
    )
  }
}

/** Dimensiones de trabajo: mantiene el aspecto, acotando el lado mayor. */
export function workDimensions(
  naturalWidth: number,
  naturalHeight: number,
  maxWorkSide: number,
): { width: number; height: number } {
  return axesDims(naturalWidth, naturalHeight, maxWorkSide)
}

/** Decodifica, redimensiona a escala de trabajo y extrae ImageData. */
export async function loadImageFile(
  file: File,
  limits: LoadLimits,
): Promise<DecodedImage> {
  validateImageFile(file, limits)
  const bitmap = await decode(file)
  const { width, height } = workDimensions(
    bitmap.width,
    bitmap.height,
    limits.maxWorkSide,
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new LoadImageError('process', 'No se pudo preparar el lienzo.')
  ctx.drawImage(bitmap, 0, 0, width, height)
  const imageData = ctx.getImageData(0, 0, width, height)

  return {
    originalUrl: URL.createObjectURL(file),
    work: {
      width,
      height,
      data: imageData.data,
    },
    naturalWidth: bitmap.width,
    naturalHeight: bitmap.height,
    bitmap,
  }
}

async function decode(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== 'function') {
    throw new LoadImageError(
      'process',
      'Tu navegador no soporta decodificación de imágenes.',
    )
  }
  try {
    return await createImageBitmap(file)
  } catch {
    throw new LoadImageError(
      'process',
      'No se pudo leer la imagen. Probá con otro archivo.',
    )
  }
}

/** Libera recursos de una DecodedImage que ya no se usa. */
export function releaseImage(image: Pick<DecodedImage, 'originalUrl' | 'bitmap'>): void {
  URL.revokeObjectURL(image.originalUrl)
  image.bitmap.close()
}
