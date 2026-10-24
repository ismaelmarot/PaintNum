import { describe, expect, it } from 'vitest'
import { jsPDF } from 'jspdf'
import { buildPaletteCsv } from '@/utils/exporting/paletteCsv'
import { drawTablePage, fitRect } from '@/utils/exporting/paintingPdf'
import { exportScale, pageDimensionsMm } from '@/utils/exporting/canvases'
import { generatePaintByNumbers } from '@/utils/imageProcessing/pipeline'
import { solidSplitImage } from '@/utils/imageProcessing/__fixtures__/images'
import { PAPER_SIZES_MM } from '@/config/printing'
import type { PaletteColor, PaperConfig } from '@/interfaces'
import type { PaintByNumberResult } from '@/interfaces/pbn'

const BASE_CONFIG = {
  colorCount: 6,
  smallRegionRatio: 0.002,
  smallRegionMinPx: 0,
  maxMergePasses: 2,
}

const PAPER: PaperConfig = {
  paperSize: 'A4',
  orientation: 'portrait',
  marginsMm: 10,
}

function fakePalette(length: number): PaletteColor[] {
  return Array.from({ length }, (_, i) => ({
    number: i + 1,
    index: i,
    color: { r: (i * 37) % 256, g: (i * 53) % 256, b: (i * 71) % 256 },
    pixelCount: 10,
    coverage: 0.1,
  }))
}

function fakeResultBut(palette: PaletteColor[]): PaintByNumberResult {
  return {
    width: 8,
    height: 8,
    palette,
    labels: new Uint8Array(64).fill(0),
    regionIds: new Int32Array(64).fill(0),
    regions: [],
    config: BASE_CONFIG,
  }
}

describe('buildPaletteCsv', () => {
  it('incluye BOM UTF-8 y columnas numero/hex/rgb/rgba/superficie', () => {
    const result = generatePaintByNumbers(solidSplitImage(), BASE_CONFIG)
    const csv = buildPaletteCsv(result.palette)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('\uFEFFnumero,hex,rgb,rgba,superficie_pct,pixeles')
    // BOM + encabezado comparten la primera línea; una fila por color.
    expect(lines).toHaveLength(result.palette.length + 1)

    for (const color of result.palette) {
      const searched = lines.find((line) => line.startsWith(`${color.number},`))
      expect(searched).toBeDefined()
      expect(searched).toContain(`${color.color.r}, ${color.color.g}, ${color.color.b}`)
    }
  })
})

describe('paintingPdf', () => {
  it('fitRect conserva proporciones dentro del rectángulo de contenido', () => {
    const fit = fitRect(200, 100, 100, 100)
    expect(fit.w).toBe(100)
    expect(fit.h).toBe(50)
  })

  it('drawTablePage pagina correctamente cuando hay más filas que las que caben', () => {
    const doc = new jsPDF({ unit: 'mm', format: [210, 297], orientation: 'portrait' })
    const palette = fakePalette(10)
    const result = fakeResultBut(palette)

    // Alto de contenido chico para forzar pocas filas por página.
    const contentHeight = 40
    // head raíz: title y → theader y → maxRows = floor((40 - 19.2)/6.4) - 1 = 2
    let next = 0
    let pages = 0
    while (next < palette.length && pages < 20) {
      next = drawTablePage(doc, result, 10, 190, next, contentHeight)
      pages++
    }

    expect(next).toBe(palette.length)
    // 2 filas por página → 5 páginas para 10 colores.
    expect(pages).toBe(5)
  })

  it('un color por línea se dibuja en la tabla sin huecos', () => {
    const doc = new jsPDF({ unit: 'mm', format: [210, 297], orientation: 'portrait' })
    const result = fakeResultBut(fakePalette(3))
    const next = drawTablePage(doc, result, 10, 190, 0, 277)
    expect(next).toBe(3)
  })
})

describe('pageDimensionsMm', () => {
  it('A4 vertical y horizontal consommutativo', () => {
    expect(pageDimensionsMm({ ...PAPER, orientation: 'portrait' })).toEqual({
      widthMm: PAPER_SIZES_MM.A4.width,
      heightMm: PAPER_SIZES_MM.A4.height,
    })
    expect(pageDimensionsMm({ ...PAPER, orientation: 'landscape' })).toEqual({
      widthMm: PAPER_SIZES_MM.A4.height,
      heightMm: PAPER_SIZES_MM.A4.width,
    })
  })
})

describe('exportScale', () => {
  it('escala hacia arriba moderado y baja para cubrir maxSide si la lámina es más grande', () => {
    expect(exportScale({ width: 800, height: 600 }, 2400)).toBeLessThanOrEqual(4)
    expect(exportScale({ width: 4800, height: 3200 }, 2400)).toBeCloseTo(0.496)
  })
})
