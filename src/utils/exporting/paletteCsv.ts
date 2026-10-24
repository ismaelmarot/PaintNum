/** CSV de la tabla de colores (UTF-8 con BOM para abrir bien en Excel). */

import type { PaletteColor } from '@/interfaces'
import { hexFrom } from '@/interfaces/image'

export function paletteRow(paletteColor: PaletteColor): string[] {
  const { color, number, pixelCount, coverage } = paletteColor
  return [
    String(number),
    hexFrom(color),
    `${color.r}, ${color.g}, ${color.b}`,
    `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
    `${(coverage * 100).toFixed(1)}`,
    String(pixelCount),
  ]
}

export const PALETTE_CSV_HEADER = [
  'numero',
  'hex',
  'rgb',
  'rgba',
  'superficie_pct',
  'pixeles',
]

export function buildPaletteCsv(palette: PaletteColor[]): string {
  const sorted = [...palette].sort((a, b) => a.number - b.number)
  const lines = [PALETTE_CSV_HEADER.join(',')]
  for (const paletteColor of sorted) {
    lines.push(paletteRow(paletteColor).join(','))
  }
  // BOM: los valores con tilde y el formato viajan seguros a Excel.
  return `${'\uFEFF'}${lines.join('\n')}`
}
