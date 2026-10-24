/** Tipos del resultado de generación de pintura por números. */

import type { RgbColor } from '@/interfaces/image'

/** Color de la paleta con su número impreso y su ocupación real. */
export interface PaletteColor {
  /** Número impreso en la lámina (1..n), ordenado por superficie. */
  number: number
  /** Índice dentro de la paleta interna (0..K-1). */
  index: number
  /** Color efectivo de la cuantización. */
  color: RgbColor
  /** Cantidad de píxeles asignados al color tras la segmentación final. */
  pixelCount: number
  /** Proporción de superficie ocupada (0..1). */
  coverage: number
}

/** Región conexa pintable con un solo color. */
export interface Region {
  /** Identificador interno denso (0..n-1). */
  id: number
  /** Índice del color de la paleta dueño de la región. */
  colorIndex: number
  /** Área en píxeles. */
  area: number
  /** Centroide en píxeles (posición del número). */
  centroid: { x: number; y: number }
  /** Rectángulo envolvente: xmin, ymin, xmax (exclusivo), ymax (exclusivo). */
  bounds: { xmin: number; ymin: number; xmax: number; ymax: number }
}

/** Estrategia configurable para regiones difíciles de pintar. */
export type SmallRegionStrategy = 'merge-largest-neighbor'

/** Configuración de generación (todo configurable desde la UI o backend-free defaults). */
export interface GenerationConfig {
  /** Cantidad deseada de colores; la paleta final puede tener menos. */
  colorCount: number
  /** Fracción de superficie (0..1) que define "región pequeña". */
  smallRegionRatio: number
  /** Área mínima absoluta en px para tolerar una región sin fusionar. */
  smallRegionMinPx: number
  /** Límite de pasadas de fusión para evitar bucles patológicos. */
  maxMergePasses: number
}

/** Resultado completo de la generación: paleta, etiquetas y regiones. */
export interface PaintByNumberResult {
  width: number
  height: number
  /** Paleta final ordenada por número (1..n). */
  palette: PaletteColor[]
  /** Índice de color de la paleta (0..K-1) por píxel. */
  labels: Uint8Array
  /** Identificador de región por píxel. */
  regionIds: Int32Array
  /** Regiones densas sincronizadas con `regionIds`. */
  regions: Region[]
  /** Configuración efectivamente aplicada. */
  config: GenerationConfig
}
