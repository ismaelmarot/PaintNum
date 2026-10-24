/** Segmentación: etiquetado por color, regiones conexas y fusión de regiones pequeñas. */

import type { ImageDataLike, RgbColor } from '@/interfaces/image'

/** Índice del color más cercano de la paleta por píxel (con caché por color exacto). */
export function assignLabels(
  image: ImageDataLike,
  palette: RgbColor[],
): Uint8Array {
  const { data, width, height } = image
  const n = width * height
  if (n === 0) throw new RangeError('Imagen vacía')
  if (palette.length === 0) throw new RangeError('Paleta vacía')
  if (palette.length > 256) throw new RangeError('Paleta demasiado grande (> 256)')

  const labels = new Uint8Array(n)
  const cache = new Map<number, number>()

  for (let i = 0; i < n; i++) {
    const o = i * 4
    const key = ((data[o]! << 16) | (data[o + 1]! << 8) | data[o + 2]!) >>> 0
    const cached = cache.get(key)
    if (cached !== undefined) {
      labels[i] = cached
      continue
    }
    const candidate: RgbColor = {
      r: data[o]!,
      g: data[o + 1]!,
      b: data[o + 2]!,
    }
    let best = 0
    let bestDist = Infinity
    for (let c = 0; c < palette.length; c++) {
      const color = palette[c]!
      const dr = candidate.r - color.r
      const dg = candidate.g - color.g
      const db = candidate.b - color.b
      const dist = dr * dr + dg * dg + db * db
      if (dist < bestDist) {
        bestDist = dist
        best = c
        if (dist === 0) break
      }
    }
    cache.set(key, best)
    labels[i] = best
  }
  return labels
}

export interface RegionMap {
  /** Id de región por píxel, con ids densos 0..count-1. */
  ids: Int32Array
  count: number
  /** Área en píxeles por id de región. */
  areas: number[]
  /** Frontera 4-conn compartida: borderCounts[a][b] = longitud entre a y b. */
  borderCounts: number[][]
}

/** Componentes conexos 4-conn sobre las etiquetas (flood fill iterativo). */
export function connectedComponents(
  labels: Uint8Array,
  width: number,
  height: number,
): RegionMap {
  const n = width * height
  const ids = new Int32Array(n).fill(-1)
  const areas: number[] = []
  const stack = new Int32Array(n)
  let count = 0

  for (let seed = 0; seed < n; seed++) {
    if (ids[seed] !== -1) continue
    const id = count++
    const label = labels[seed]!
    let top = 0
    stack[top++] = seed
    ids[seed] = id
    let area = 0

    while (top > 0) {
      const p = stack[--top]!
      area++
      const x = p % width
      const y = (p / width) | 0

      // 4-conectividad: derecha, izquierda, abajo, arriba.
      if (x + 1 < width) {
        const q = p + 1
        if (labels[q] === label && ids[q] === -1) {
          ids[q] = id
          stack[top++] = q
        }
      }
      if (x > 0) {
        const q = p - 1
        if (labels[q] === label && ids[q] === -1) {
          ids[q] = id
          stack[top++] = q
        }
      }
      if (y + 1 < height) {
        const q = p + width
        if (labels[q] === label && ids[q] === -1) {
          ids[q] = id
          stack[top++] = q
        }
      }
      if (y > 0) {
        const q = p - width
        if (labels[q] === label && ids[q] === -1) {
          ids[q] = id
          stack[top++] = q
        }
      }
    }
    areas[id] = area
  }

  // Fronteras entre regiones: un único barrido comparando vecinos derecho e inferior.
  const borderCounts: number[][] = Array.from({ length: count }, () => [])
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = y * width + x
      const a = ids[p]!
      if (x + 1 < width) {
        const b = ids[p + 1]!
        if (a !== b) {
          borderCounts[a]![b] = (borderCounts[a]![b] ?? 0) + 1
          borderCounts[b]![a] = (borderCounts[b]![a] ?? 0) + 1
        }
      }
      if (y + 1 < height) {
        const b = ids[p + width]!
        if (a !== b) {
          borderCounts[a]![b] = (borderCounts[a]![b] ?? 0) + 1
          borderCounts[b]![a] = (borderCounts[b]![a] ?? 0) + 1
        }
      }
    }
  }

  return { ids, count, areas, borderCounts }
}

export interface MergeOptions {
  /** Regiones con área < minArea se fusionan con su vecino de mayor frontera. */
  minArea: number
  /** Pases por duplicado de seguridad; normalmente 2 bastan para cadenas simples. */
  maxPasses?: number
}

export interface MergeResult {
  /** Cantidad de regiones vivas tras la fusión. */
  count: number
  /** Áreas por id compactado (denso 0..count-1). */
  areas: number[]
}

/**
 * Fusiona regiones pequeñas hacia el vecino con mayor frontera compartida,
 * de menor a mayor área para determinismo. `ids` queda compactado en sitio.
 */
export function mergeSmallRegions(
  labels: Uint8Array,
  ids: Int32Array,
  areas: number[],
  borderCounts: number[][],
  mergeOptions: MergeOptions,
): MergeResult {
  const { minArea, maxPasses = 2 } = mergeOptions
  const totalRegions = areas.length
  const alive = areas.map(() => true)
  const workAreas = [...areas]

  // Color representativo por región (el de su primer píxel) y
  // píxeles de las regiones pequeñas agrupados en un único barrido.
  const regionLabels = new Int32Array(totalRegions).fill(-1)
  const pixelsById = new Map<number, number[]>()
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]!
    if (regionLabels[id] === -1) regionLabels[id] = labels[i]!
    if (workAreas[id]! < minArea) {
      let list = pixelsById.get(id)
      if (!list) {
        list = []
        pixelsById.set(id, list)
      }
      list.push(i)
    }
  }

  let passes = 0
  while (passes < maxPasses) {
    let mergedAny = false
    passes++

    const candidates = [...pixelsById.keys()].filter(
      (id) => alive[id] && workAreas[id]! < minArea,
    )
    candidates.sort((a, b) => workAreas[a]! - workAreas[b]! || a - b)

    for (const id of candidates) {
      if (!alive[id] || workAreas[id]! >= minArea) continue

      let bestNeighbor = -1
      let bestBorder = -1
      for (let other = 0; other < totalRegions; other++) {
        if (!alive[other] || other === id) continue
        const border = borderCounts[id]?.[other] ?? 0
        if (border > bestBorder) {
          bestBorder = border
          bestNeighbor = other
        }
      }
      if (bestNeighbor < 0) continue

      // Relabel de píxeles mediante la lista precalculada; el color de la
      // región absorbida pasa al de la región dominante ("pintada igual").
      const pixels = pixelsById.get(id) ?? []
      const neighborPixels = pixelsById.get(bestNeighbor) ?? []
      const targetLabel = regionLabels[bestNeighbor]!
      for (const p of pixels) {
        ids[p] = bestNeighbor
        labels[p] = targetLabel
        neighborPixels.push(p)
      }
      pixels.length = 0
      pixelsById.set(bestNeighbor, neighborPixels)
      pixelsById.delete(id)

      alive[id] = false
      workAreas[bestNeighbor]! += workAreas[id]!
      mergedAny = true

      // Traslado de fronteras de la región absorbida al absorbente.
      const sourceBorders = borderCounts[id]!
      for (let other = 0; other < totalRegions; other++) {
        if (!alive[other] || other === bestNeighbor) continue
        const moved = sourceBorders[other] ?? 0
        if (moved === 0) continue
        borderCounts[bestNeighbor]![other] =
          (borderCounts[bestNeighbor]![other] ?? 0) + moved
        borderCounts[other]![bestNeighbor] =
          (borderCounts[other]![bestNeighbor] ?? 0) + moved
        sourceBorders[other] = 0
        borderCounts[other]![id] = 0
      }
    }

    if (!mergedAny) break
  }

  // Compactar ids a un dominio denso.
  const remap = new Int32Array(totalRegions).fill(-1)
  let liveCount = 0
  for (let id = 0; id < totalRegions; id++) {
    if (alive[id]) remap[id] = liveCount++
  }
  for (let i = 0; i < ids.length; i++) {
    ids[i] = remap[ids[i]!]!
  }
  const compactAreas = new Array<number>(liveCount).fill(0)
  for (let id = 0; id < totalRegions; id++) {
    if (alive[id]) compactAreas[remap[id]!] = workAreas[id]!
  }
  return { count: liveCount, areas: compactAreas }
}
