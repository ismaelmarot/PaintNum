/** Cuantización de colores: median cut, determinista y sin dependencias. */

import type { ImageDataLike, RgbColor } from '@/interfaces/image'
import { rgbKey } from '@/utils/imageProcessing/rgb'

interface Sample {
  r: number
  g: number
  b: number
}

const MAX_SAMPLES = 120_000

function takeSamples(image: ImageDataLike, maxSamples: number): Sample[] {
  const { data } = image
  const pixels = image.width * image.height
  const step = Math.max(1, Math.ceil(pixels / maxSamples))
  const samples: Sample[] = []
  for (let i = 0; i < pixels; i += step) {
    const o = i * 4
    samples.push({ r: data[o]!, g: data[o + 1]!, b: data[o + 2]! })
  }
  return samples
}

const rangeOf = (bucket: Sample[], channel: keyof Sample): number => {
  let min = 255
  let max = 0
  for (const s of bucket) {
    const v = s[channel]
    if (v < min) min = v
    if (v > max) max = v
  }
  return max - min
}

function average(bucket: Sample[]): RgbColor {
  let r = 0
  let g = 0
  let b = 0
  for (const s of bucket) {
    r += s.r
    g += s.g
    b += s.b
  }
  const n = bucket.length
  return {
    r: Math.round(r / n),
    g: Math.round(g / n),
    b: Math.round(b / n),
  }
}

/**
 * Divide el bucket con mayor volumen por su canal con mayor rango (median).
 */function split(bucket: Sample[]): [Sample[], Sample[]] | null {
  if (bucket.length < 2) return null
  const channels: (keyof Sample)[] = ['r', 'g', 'b']
  let bestChannel: keyof Sample = 'r'
  let bestRange = -1
  for (const ch of channels) {
    const range = rangeOf(bucket, ch)
    if (range > bestRange) {
      bestRange = range
      bestChannel = ch
    }
  }
  if (bestRange === 0) return null

  const sorted = [...bucket].sort((a, b) => a[bestChannel] - b[bestChannel])
  const mid = sorted.length >> 1
  return [sorted.slice(0, mid), sorted.slice(mid)]
}

/**
 * Cuantiza la imagen en hasta `maxColors` colores con median cut.
 * La paleta resultante puede tener menos colores si la imagen los tiene.
 * Orden estable: por componentes RGB para determinismo.
 */
export function quantizeColors(
  image: ImageDataLike,
  maxColors: number,
): RgbColor[] {
  if (maxColors < 1) throw new RangeError('maxColors debe ser >= 1')
  let buckets: Sample[][] = [takeSamples(image, MAX_SAMPLES)]

  while (buckets.length < maxColors) {
    // Elegimos el bucket a dividir: mayor volumen (suma de rangos).
    let bestIdx = -1
    let bestVolume = -1
    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i]!
      const volume =
        rangeOf(b, 'r') + rangeOf(b, 'g') + rangeOf(b, 'b')
      if (volume > bestVolume) {
        bestVolume = volume
        bestIdx = i
      }
    }
    if (bestIdx < 0 || bestVolume === 0) break
    const halves = split(buckets[bestIdx]!)
    if (halves === null) break
    buckets = buckets
      .slice(0, bestIdx)
      .concat([halves[0]!, halves[1]!], buckets.slice(bestIdx + 1))
  }

  const unique = new Map<number, RgbColor>()
  for (const bucket of buckets) {
    if (bucket.length === 0) continue
    const color = average(bucket)
    unique.set(rgbKey(color), color)
  }
  return [...unique.values()].sort(
    (a, b) => a.r - b.r || a.g - b.g || a.b - b.b,
  )
}
