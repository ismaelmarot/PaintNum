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
  maxColors: 24,
  defaultColorCount: 8,
  smallRegionRatio: 0.003,
  smallRegionMinPx: 80,
  maxMergePasses: 2,
  maxWorkSide: 1600,
  maxFileBytes: 15 * 1024 * 1024,
  acceptedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
}

/** Presets de detalle: cuánta agresividad al fusionar regiones pequeñas. */
export const DETAIL_PRESETS = {
  fine: { smallRegionRatio: 0.0012, smallRegionMinPx: 36 },
  balanced: { smallRegionRatio: 0.003, smallRegionMinPx: 80 },
  coarse: { smallRegionRatio: 0.006, smallRegionMinPx: 200 },
} as const satisfies Record<string, { smallRegionRatio: number; smallRegionMinPx: number }>
