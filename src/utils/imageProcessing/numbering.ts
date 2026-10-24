/** Numeración de colores: orden estable por superficie, 1..n. */

import type { PaletteColor, Region } from '@/interfaces/pbn'
import type { RgbColor } from '@/interfaces/image'

export interface NumberPaletteInput {
  colors: RgbColor[]
  /** Cantidad de píxeles por índice de color (índice ⇔ colors). */
  pixelCounts: number[]
  totalPixels: number
}

/**
 * Construye la paleta Ordenada por número (1..n por superficie descendente).
 * Empates: mayor área primero, luego índice de color ascendente → determinista.
 */
export function buildPalette({
  colors,
  pixelCounts,
  totalPixels,
}: NumberPaletteInput): PaletteColor[] {
  if (colors.length !== pixelCounts.length) {
    throw new Error('pixelCounts debe tener la misma longitud que colors')
  }
  if (totalPixels <= 0) throw new RangeError('totalPixels debe ser > 0')

  const numberForIndex = new Map<number, number>()
  const order = colors
    .map((color, index) => ({ color, index, count: pixelCounts[index]! }))
    .sort(
      (a, b) =>
        b.count - a.count || a.index - b.index,
    )
  order.forEach((entry, position) => {
    numberForIndex.set(entry.index, position + 1)
  })

  return colors.map((color, index) => {
    const count = pixelCounts[index]!
    return {
      color,
      index,
      number: numberForIndex.get(index)!,
      pixelCount: count,
      coverage: count / totalPixels,
    }
  })
}

/** Color dominante de la paleta: el más grande. Útil para fondo default. */
export function dominantColorIndex(palette: PaletteColor[]): number {
  if (palette.length === 0) throw new RangeError('Paleta vacía')
  return palette.reduce(
    (best, color) => (color.coverage > palette[best]!.coverage ? color.index : best),
    0,
  )
}

/** La superficie de todas las regiones suma el total de píxeles. */
export function checkRegionAreaConsistency(regions: Region[], totalPixels: number): boolean {
  const sum = regions.reduce((acc, region) => acc + region.area, 0)
  return sum === totalPixels
}
