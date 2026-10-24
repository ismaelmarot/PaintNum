import { describe, expect, it } from 'vitest'
import { composePaintingImageData, computeNumberPlacements } from '@/utils/imageProcessing/renderPainting'
import type { PaintByNumberResult } from '@/interfaces/pbn'

interface RegionDef {
  x: number
  y: number
  w: number
  h: number
  n: number
}

function fakeResult(regionDefs: RegionDef[]): PaintByNumberResult {
  const regions = regionDefs.map((def, i) => ({
    id: i + 1,
    colorIndex: i,
    area: def.w * def.h,
    // Centroide AL BORDE a propósito: valida el clamp anti-desborde.
    centroid: { x: def.x + def.w * 0.9, y: def.y + def.h * 0.5 },
    bounds: { xmin: def.x, ymin: def.y, xmax: def.x + def.w, ymax: def.y + def.h },
  }))
  return {
    width: 200,
    height: 100,
    palette: regionDefs.map((_, i) => ({
      number: i + 1,
      index: i,
      color: { r: 200, g: 100, b: 50 },
      pixelCount: 0,
      coverage: 0,
    })),
    labels: new Uint8Array(200 * 100).fill(0),
    regionIds: new Int32Array(200 * 100).fill(0),
    regions,
    config: { colorCount: 4, smallRegionRatio: 0.002, smallRegionMinPx: 0, maxMergePasses: 2 },
  }
}

describe('computeNumberPlacements (tamaño proporcional acotado)', () => {
  it('región enorme: NUNCA supera el topeglobal (2.5% del lado mayor x escala)', () => {
    const result = fakeResult([{ x: 0, y: 0, w: 200, h: 100, n: 1 }])
    const [placement] = computeNumberPlacements(result, 1, 2)
    expect(placement).toBeDefined()
    // Tope máximo de 3px aplicado aunque el cálculo sea 5px
    expect(placement!.fontSize).toBeLessThanOrEqual(3)
    expect(placement!.fontSize).toBeCloseTo(3)
  })

it('regiones muy chicas omite el glifo (mínimo 2px), solo la grande lleva número', () => {
    // Con factor 0.35 y minFontPx=2: heights 4,5→<2px (omitidas), height 8→2.8px (incluye)
    const result = fakeResult([
      { x: 0, y: 0, w: 8, h: 4, n: 1 },
      { x: 0, y: 0, w: 10, h: 5, n: 2 },
      { x: 0, y: 0, w: 20, h: 8, n: 3 },
    ])
    const placements = computeNumberPlacements(result, 1, 2)
    // Solo la región grande (h=8) supera minFontPx=2 (2.8 ≥ 2)
    expect(placements).toHaveLength(1)
    expect(placements[0]!.fontSize).toBeCloseTo(8 * 0.25)
  })

it('el tope escala con la resolución de SALIDA (preview 1x vs export 1.24x)', () => {
    const result = fakeResult([{ x: 0, y: 0, w: 200, h: 100, n: 1 }])
    const atExportScale = computeNumberPlacements(result, 1.24, 2)
    // Tope máximo de 3px en ambos scales
    expect(atExportScale[0]!.fontSize).toBeLessThanOrEqual(3)
    expect(computeNumberPlacements(result, 1, 2)[0]!.fontSize).toBeLessThanOrEqual(3)
  })

  it('glifo siempre DENTRO de la envolvente: el bloque no cruza contornos ni vecinas', () => {
    const result = fakeResult([
      { x: 0, y: 0, w: 100, h: 60, n: 1 },
      { x: 100, y: 0, w: 100, h: 60, n: 2 },
    ])
    for (const placement of computeNumberPlacements(result, 1, 4)) {
      const halfW = placement.text.length * 0.31 * placement.fontSize
      expect(placement.x - halfW).toBeGreaterThanOrEqual(
        placement.x > 100 ? 100 : 0 - 0.001,
      )
    }
  })

  it('región demasiado chica: se omite sin número (sin números fuera de su área)', () => {
    const result = fakeResult([{ x: 0, y: 0, w: 1, h: 1, n: 1 }])
    expect(computeNumberPlacements(result, 1, 40)).toHaveLength(0)
  })
})

describe('composePaintingImageData (lámina B/N)', () => {
  it('relleno blanco uniforme en TODOS los píxeles (lista para pintar)', () => {
    const result = fakeResult([{ x: 0, y: 0, w: 200, h: 100, n: 1 }])
    const image = composePaintingImageData(result)
    for (let i = 0; i < image.data.length; i += 4) {
      expect(image.data[i]).toBe(255)
      expect(image.data[i + 1]).toBe(255)
      expect(image.data[i + 2]).toBe(255)
      expect(image.data[i + 3]).toBe(255)
    }
  })
})
