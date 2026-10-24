/** Tipos de impresión compartidos (papel, orientación, márgenes). */

export interface PaperSizeMm {
  width: number
  height: number
}

export type PaperSizeId = 'A4' | 'A3' | 'Letter' | 'A5' | 'A2' | 'Legal' | 'Tabloid' | 'Custom'

export type Orientation = 'portrait' | 'landscape'

export interface PaperConfig {
  paperSize: PaperSizeId
  orientation: Orientation
  /** Margen de impresión en mm, aplicado en los cuatro lados. */
  marginsMm: number
  /** Medidas elegidas cuando paperSize === 'Custom'. */
  customSize?: PaperSizeMm
}
