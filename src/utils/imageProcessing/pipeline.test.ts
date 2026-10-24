import { describe, expect, it } from 'vitest'
import { buildPalette, checkRegionAreaConsistency } from '@/utils/imageProcessing/numbering'
import { generatePaintByNumbers, resolveMinArea } from '@/utils/imageProcessing/pipeline'
import { emptyImage, fillRect, noisyGradientImage, solidSplitImage } from '@/utils/imageProcessing/__fixtures__/images'

const BASE_CONFIG = {
  colorCount: 6,
  smallRegionRatio: 0.001,
  smallRegionMinPx: 4,
  maxMergePasses: 2,
}

describe('buildPalette (numeración)', () => {
  it('asigna números 1..n por superficie descendente', () => {
    const palette = buildPalette({
      colors: [
        { r: 1, g: 1, b: 1 },
        { r: 2, g: 2, b: 2 },
        { r: 3, g: 3, b: 3 },
      ],
      pixelCounts: [3, 9, 6],
      totalPixels: 18,
    })
    const numbers = palette.sort((a, b) => a.number - b.number).map((c) => c.number)
    expect(numbers).toEqual([1, 2, 3])
    expect(palette.find((c) => c.number === 1)!.index).toBe(1)
    expect(palette.find((c) => c.number === 2)!.index).toBe(2)
    expect(palette.find((c) => c.number === 3)!.index).toBe(0)
  })

  it('la cobertura suma 1', () => {
    const palette = buildPalette({
      colors: [
        { r: 1, g: 1, b: 1 },
        { r: 2, g: 2, b: 2 },
      ],
      pixelCounts: [7, 7],
      totalPixels: 14,
    })
    expect(palette.reduce((acc, c) => acc + c.coverage, 0)).toBeCloseTo(1)
  })
})

describe('generatePaintByNumbers (pipeline puro)', () => {
  it('determinista y estable: mismos datos ⇒ mismo resultado', () => {
    const image = noisyGradientImage(48, 32)
    const a = generatePaintByNumbers(image, BASE_CONFIG)
    const b = generatePaintByNumbers(image, BASE_CONFIG)
    expect([...a.labels]).toEqual([...b.labels])
    expect(a.palette).toEqual(b.palette)
    expect(a.regions).toEqual(b.regions)
  })

  it('dos colores planos ⇒ 2 colores, 2 regiones, capa consistente', () => {
    const image = emptyImage(8, 1)
    fillRect(image, 0, 0, 5, 1, { r: 220, g: 30, b: 30 })
    fillRect(image, 5, 0, 3, 1, { r: 30, g: 40, b: 220 })
    const result = generatePaintByNumbers(image, {
      ...BASE_CONFIG,
      colorCount: 8,
      smallRegionMinPx: 2,
    })

    expect(result.palette).toHaveLength(2)
    expect(
      [...result.palette].sort((a, b) => a.number - b.number).map((c) => c.number),
    ).toEqual([1, 2])
    expect(checkRegionAreaConsistency(result.regions, 8)).toBe(true)

    // Números ⇔ colores 1:1.
    const uniqueColors = new Set(result.palette.map((c) => c.color))
    expect(uniqueColors.size).toBe(2)

    // Cada píxel pertenece a una región viva cuyo color coincide con la paleta.
    const colorIndexByRegion = new Map(
      result.regions.map((r) => [r.id, r.colorIndex]),
    )
    for (let i = 0; i < result.regionIds.length; i++) {
      expect(colorIndexByRegion.get(result.regionIds[i]!)).toBe(result.labels[i])
    }

    // El color más extenso (rojo, 5px) lleva el número 1.
    const largest = [...result.regions].sort((a, b) => b.area - a.area)[0]!
    const colorNumber = result.palette.find(
      (c) => c.index === largest.colorIndex,
    )!.number
    expect(colorNumber).toBe(1)
  })

  it('regiones pequeñas se fusionan según la estrategia configurada', () => {
    const image = solidSplitImage()
    const aggressive = generatePaintByNumbers(image, {
      ...BASE_CONFIG,
      smallRegionMinPx: 100,
    })
    // Área total 8px < minArea 100 → todo absorbido en 1 región final.
    expect(aggressive.regions).toHaveLength(1)

    const fine = generatePaintByNumbers(image, {
      ...BASE_CONFIG,
      smallRegionMinPx: 0,
      smallRegionRatio: 0,
    })
    expect(fine.regions.length).toBeGreaterThanOrEqual(aggressive.regions.length)
  })

  it('config inválida dispara error', () => {
    const image = solidSplitImage()
    expect(() => generatePaintByNumbers(image, { ...BASE_CONFIG, colorCount: 1 })).toThrow(
      RangeError,
    )
  })
})

describe('resolveMinArea', () => {
  it('toma el máximo entre el mínimo absoluto y la fracción de superficie', () => {
    expect(
      resolveMinArea({ ...BASE_CONFIG, smallRegionMinPx: 80, smallRegionRatio: 0.003 }, 1000),
    ).toBe(80)
    expect(
      resolveMinArea({ ...BASE_CONFIG, smallRegionMinPx: 10, smallRegionRatio: 0.03 }, 1000),
    ).toBe(30)
  })
})
