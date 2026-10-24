/** Estadísticas por región tras la segmentación final (determinista). */

import type { Region } from '@/interfaces/pbn'

/**
 * Color, área, centroide y envolvente de cada región.
 * `labels` debe ser consistente: todos los píxeles de una región comparten color.
 */
export function computeRegionStats(
  labels: Uint8Array,
  regionIds: Int32Array,
  regionCount: number,
  width: number,
  height: number,
): Region[] {
  const areas = new Array<number>(regionCount).fill(0)
  const colorIndexes = new Int32Array(regionCount).fill(-1)
  const sumX = new Float64Array(regionCount)
  const sumY = new Float64Array(regionCount)
  const minX = new Int32Array(regionCount).fill(Number.MAX_SAFE_INTEGER)
  const minY = new Int32Array(regionCount).fill(Number.MAX_SAFE_INTEGER)
  const maxX = new Int32Array(regionCount).fill(-1)
  const maxY = new Int32Array(regionCount).fill(-1)

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width
    for (let x = 0; x < width; x++) {
      const p = rowOffset + x
      const id = regionIds[p]!
      areas[id]++
      if (colorIndexes[id] === -1) colorIndexes[id] = labels[p]!
      sumX[id] += x
      sumY[id] += y
      if (x < minX[id]!) minX[id] = x
      if (x > maxX[id]!) maxX[id] = x
      if (y < minY[id]!) minY[id] = y
      if (y > maxY[id]!) maxY[id] = y
    }
  }

  const regions: Region[] = []
  for (let id = 0; id < regionCount; id++) {
    const area = areas[id]!
    regions.push({
      id,
      colorIndex: colorIndexes[id]!,
      area,
      centroid: { x: sumX[id]! / area, y: sumY[id]! / area },
      bounds: { xmin: minX[id]!, ymin: minY[id]!, xmax: maxX[id]! + 1, ymax: maxY[id]! + 1 },
    })
  }
  return regions
}
