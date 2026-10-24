/** Constantes de impresión y exportación (papel, márgenes, DPI). */

import type {
  Orientation,
  PaperConfig,
  PaperSizeId,
  PaperSizeMm,
} from '@/interfaces/printing'

export const PAPER_SIZES_MM: Record<Exclude<PaperSizeId, 'Custom'>, PaperSizeMm> = {
  A5: { width: 148, height: 210 },
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A2: { width: 420, height: 594 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  Tabloid: { width: 279.4, height: 431.8 },
}

/** Límites del papel personalizado (mm). */
export const CUSTOM_PAPER_LIMITS = {
  minSideMm: 50,
  maxSideMm: 1000,
} as const

export function isValidCustomSize(size: PaperSizeMm): boolean {
  const { width, height } = size
  return (
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width >= CUSTOM_PAPER_LIMITS.minSideMm &&
    height >= CUSTOM_PAPER_LIMITS.minSideMm &&
    width <= CUSTOM_PAPER_LIMITS.maxSideMm &&
    height <= CUSTOM_PAPER_LIMITS.maxSideMm
  )
}

/** Medida final de página antes de orientación; `undefined` = custom inválido. */
export function resolvePaperSizeMm(config: PaperConfig): PaperSizeMm | undefined {
  if (config.paperSize === 'Custom') {
    return config.customSize && isValidCustomSize(config.customSize)
      ? config.customSize
      : undefined
  }
  return PAPER_SIZES_MM[config.paperSize]
}

export const PRINTING_DEFAULTS = {
  defaultPaperSize: 'A4' as PaperSizeId,
  defaultMarginsMm: 10,
  minMarginsMm: 5,
  maxMarginsMm: 25,
  /** DPI objetivo para la lámina exportada (impresión). */
  exportDpi: 300,
  /** Límite de píxeles del lado mayor al exportar imágenes (memoria PDF). */
  maxExportSidePx: 2480,
} as const

/** Orientación inicial sugerida según el aspecto de la imagen. */
export function suggestOrientation(
  width: number,
  height: number,
): Orientation {
  return width >= height ? 'landscape' : 'portrait'
}
