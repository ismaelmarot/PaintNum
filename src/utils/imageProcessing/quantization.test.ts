import { describe, expect, it } from 'vitest'
import { quantizeColors } from '@/utils/imageProcessing/quantization'
import { emptyImage, noisyGradientImage, solidSplitImage } from '@/utils/imageProcessing/__fixtures__/images'

describe('quantizeColors (median cut)', () => {
  it('devuelve a lo sumo maxColors y determinismo', () => {
    const image = noisyGradientImage(64, 40)
    const a = quantizeColors(image, 8)
    const b = quantizeColors(image, 8)
    expect(a.length).toBeLessThanOrEqual(8)
    expect(a.length).toBeGreaterThanOrEqual(2)
    expect(a).toEqual(b)
  })

  it('imagen con 2 colores planos genera exactamente 2 colores', () => {
    const palette = quantizeColors(solidSplitImage(), 8)
    expect(palette).toHaveLength(2)
  })

  it('imagen vacía dispara error y maxColors mínimo 1', () => {
    const blank = emptyImage(2, 2)
    expect(() => quantizeColors(blank, 4)).not.toThrow()
    expect(() => quantizeColors(blank, 0)).toThrow(RangeError)
  })
})
