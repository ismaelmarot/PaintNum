/** Configuración de límites de procesamiento (MVP, editable). */

export interface ProcessingLimits {
  minColors: number
  maxColors: number
  defaultColorCount: number
  smallRegionRatio: number
  smallRegionMinPx: number
  maxMergePasses: number
  /** Lado mayor máximo de la imagen de trabajo para limitar memoria. */
  maxWorkSide: number
  /** Tamaño máximo de archivo de entrada en bytes. */
  maxFileBytes: number
  acceptedMimeTypes: readonly string[]
}

export const PROCESSING_LIMITS: ProcessingLimits = {
  minColors: 2,
  maxColors: 80,
  defaultColorCount: 16,
  smallRegionRatio: 0.0003,
  smallRegionMinPx: 6,
  maxMergePasses: 6,
  maxWorkSide: 5000,
  maxFileBytes: 15 * 1024 * 1024,
  acceptedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
}

/** Presets de detalle: cuánta agresividad al fusionar regiones pequeñas. */
export const DETAIL_PRESETS = {
  ultrafine: { smallRegionRatio: 0.0006, smallRegionMinPx: 12 },
  fine: { smallRegionRatio: 0.0012, smallRegionMinPx: 36 },
  balanced: { smallRegionRatio: 0.003, smallRegionMinPx: 80 },
  coarse: { smallRegionRatio: 0.006, smallRegionMinPx: 200 },
} as const satisfies Record<string, { smallRegionRatio: number; smallRegionMinPx: number }>
