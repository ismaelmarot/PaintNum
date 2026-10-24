import { describe, expect, it } from 'vitest'
import {
  assignLabels,
  connectedComponents,
  mergeSmallRegions,
} from '@/utils/imageProcessing/segmentation'
import {
  emptyImage,
  noisyGradientImage,
  solidSplitImage,
  fillRect,
} from '@/utils/imageProcessing/__fixtures__/images'

describe('assignLabels', () => {
  it('etiqueta cada píxel con el color más cercano', () => {
    const image = solidSplitImage()
    const labels = assignLabels(image, [
      { r: 220, g: 30, b: 30 },
      { r: 30, g: 40, b: 220 },
    ])
    // Columnas 0-1 rojo (idx 0-1 fila 0, 4-5 fila 1), columnas 2-3 azul.
    expect(labels[0]).toBe(0)
    expect(labels[2]).toBe(1)
    expect(labels[4]).toBe(0)
    expect(labels[6]).toBe(1)
  })

  it('valida paleta vacía y paleta demasiado grande', () => {
    const image = solidSplitImage()
    expect(() => assignLabels(image, [])).toThrow(RangeError)
    const big = Array.from({ length: 257 }, (_, i) => ({ r: i, g: i, b: i }))
    expect(() => assignLabels(image, big)).toThrow(RangeError)
  })
})

describe('connectedComponents', () => {
  it('dos mitades → 2 regiones 4-conexas', () => {
    const image = solidSplitImage()
    const labels = assignLabels(image, [
      { r: 220, g: 30, b: 30 },
      { r: 30, g: 40, b: 220 },
    ])
    const { ids, count, areas } = connectedComponents(labels, image.width, image.height)
    expect(count).toBe(2)
    expect([...areas]).toEqual([4, 4])
    expect(new Set([...ids])).toEqual(new Set([0, 1]))
  })

  it('un mismo color dividido en cuadrantes separados crea regiones distintas', () => {
    const image = emptyImage(4, 4)
    fillRect(image, 0, 1, 4, 3, { r: 200, g: 200, b: 200 })
    fillRect(image, 0, 0, 1, 1, { r: 10, g: 10, b: 10 })
    fillRect(image, 3, 3, 1, 1, { r: 10, g: 10, b: 10 })
    const labels = assignLabels(image, [
      { r: 10, g: 10, b: 10 },
      { r: 200, g: 200, b: 200 },
    ])
    const { count } = connectedComponents(labels, 4, 4)
    // Dos píxeles oscuros aislados + bloque gris: 3 regiones.
    expect(count).toBe(3)
  })
})

describe('mergeSmallRegions', () => {
  it('fusiona regiones pequeñas hacia el vecino con mayor frontera', () => {
    const image = emptyImage(8, 4)
    fillRect(image, 0, 0, 8, 4, { r: 200, g: 200, b: 200 })
    fillRect(image, 0, 0, 1, 2, { r: 220, g: 30, b: 30 })
    fillRect(image, 3, 0, 1, 4, { r: 30, g: 40, b: 220 })
    // Pequeño enclave en una esquina y región mediana vertical en medio.
    const labels = assignLabels(image, [
      { r: 220, g: 30, b: 30 },
      { r: 30, g: 40, b: 220 },
      { r: 200, g: 200, b: 200 },
    ])
    const cc = connectedComponents(labels, 8, 4)
    const merged = mergeSmallRegions(labels, cc.ids, cc.areas, cc.borderCounts, {
      minArea: 3,
      maxPasses: 2,
    })
    // El enclave rojo de 2px se absorbe en el gris vecino; el azul de 4px queda
    // separando el fondo en dos regiones conexas (12 = 10 + 2 absorbidos).
    expect(merged.count).toBe(3)
    expect(merged.areas).toContain(12)
    expect(merged.areas).toContain(4)
    expect(merged.areas).toContain(16)
  })

  it('compacta ids ocupando dominio denso', () => {
    const image = noisyGradientImage(24, 18)
    const labels = assignLabels(image, [
      { r: 60, g: 30, b: 90 },
      { r: 180, g: 100, b: 90 },
    ])
    const cc = connectedComponents(labels, 24, 18)
    const merged = mergeSmallRegions(labels, cc.ids, cc.areas, cc.borderCounts, {
      minArea: 4,
      maxPasses: 2,
    })
    // `cc.ids` queda compactado in place a un dominio denso 0..count-1.
    expect(Math.max(...cc.ids)).toBeLessThan(merged.count)
    expect(merged.areas).toHaveLength(merged.count)
  })
})
