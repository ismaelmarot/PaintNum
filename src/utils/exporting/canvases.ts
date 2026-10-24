/** Utilidades de render para las exportaciones (canvas + blobs). */

import type {
  DecodedImage,
  PaintByNumberResult,
} from '@/interfaces'
import type { PaperConfig } from '@/interfaces/printing'
import { PRINTING_DEFAULTS, resolvePaperSizeMm, PAPER_SIZES_MM } from '@/config/printing'
import { drawPainting } from '@/utils/imageProcessing/renderPainting'

/** Escala para exportar: acota a maxSide px en el lado mayor (permite upscale moderado). */
export function exportScale(
  result: Pick<PaintByNumberResult, 'width' | 'height'>,
  maxSide: number = PRINTING_DEFAULTS.maxExportSidePx,
): number {
  const longest = Math.max(result.width, result.height)
  if (longest <= 0) throw new RangeError('Lámina vacía')
  const scale = maxSide / longest
  return Math.min(scale, 4)
}

/** Canvas de la lámina lista para imprimir (bloques nítidos + números). */
export function paintingCanvas(
  result: PaintByNumberResult,
  maxSide: number = PRINTING_DEFAULTS.maxExportSidePx,
): HTMLCanvasElement {
  const scale = exportScale(result, maxSide)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(result.width * scale)
  canvas.height = Math.round(result.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo preparar el canvas de exportación.')
  drawPainting(ctx, result, { scale })
  return canvas
}

/** Canvas del original reescalado para exportación. */
export function originalCanvas(
  image: DecodedImage,
  maxSide: number = PRINTING_DEFAULTS.maxExportSidePx,
): HTMLCanvasElement {
  const longest = Math.max(image.naturalWidth, image.naturalHeight)
  const scale = Math.min(1, maxSide / longest)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo preparar el canvas de exportación.')
  ctx.drawImage(image.bitmap, 0, 0, canvas.width, canvas.height)
  return canvas
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('No se pudo generar el archivo PNG.'))
    }, 'image/png')
  })
}

/** Dimensiones de página en mm según paper config (portrait/landscape),
 *  incluida la medida personalizada. */
export function pageDimensionsMm(paper: PaperConfig): {
  widthMm: number
  heightMm: number
} {
  const resolved = resolvePaperSizeMm(paper) ?? PAPER_SIZES_MM.A4
  const isLandscape = paper.orientation === 'landscape'
  return {
    widthMm: isLandscape ? resolved.height : resolved.width,
    heightMm: isLandscape ? resolved.width : resolved.height,
  }
}
