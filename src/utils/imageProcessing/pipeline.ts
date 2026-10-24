/** Pipeline puro de generación de pintura por números. */

import type {
  GenerationConfig,
  PaintByNumberResult,
} from '@/interfaces/pbn'
import type { ImageDataLike } from '@/interfaces/image'
import { quantizeColors } from '@/utils/imageProcessing/quantization'
import {
  assignLabels,
  connectedComponents,
  mergeSmallRegions,
} from '@/utils/imageProcessing/segmentation'
import { computeRegionStats } from '@/utils/imageProcessing/regionStats'
import { buildPalette } from '@/utils/imageProcessing/numbering'

/** Área mínima efectiva: máximo entre el mínimo absoluto y la fracción de superficie. */
export function resolveMinArea(
  config: GenerationConfig,
  totalPixels: number,
): number {
  const relative = Math.round(config.smallRegionRatio * totalPixels)
  return Math.max(config.smallRegionMinPx, relative)
}

/**
 * Genera lámina, paleta y regiones a partir de una imagen (puro, sin DOM).
 * Regiones pequeñas se fusionan hacia el vecino con mayor frontera;
 * la paleta y el tabulado se sincronizan en el mismo paso.
 */
export function generatePaintByNumbers(
  image: ImageDataLike,
  config: GenerationConfig,
): PaintByNumberResult {
  if (!Number.isFinite(config.colorCount) || config.colorCount < 2) {
    throw new RangeError('colorCount debe ser >= 2')
  }
  if (config.smallRegionRatio < 0 || config.smallRegionMinPx < 0) {
    throw new Error('Los límites de región pequeña no pueden ser negativos')
  }

  const colors = quantizeColors(image, config.colorCount)
  if (colors.length === 0) {
    throw new Error('La imagen no contiene colores.')
  }
  const labels = assignLabels(image, colors)
  const { ids, areas, borderCounts} = connectedComponents(
    labels,
    image.width,
    image.height,
  )

  const minArea = resolveMinArea(config, image.width * image.height)
  const { count: mergedCount } = mergeSmallRegions(
    labels,
    ids,
    areas,
    borderCounts,
    {
      minArea,
      maxPasses: config.maxMergePasses,
    },
  )

  const regions = computeRegionStats(
    labels,
    ids,
    mergedCount,
    image.width,
    image.height,
  )

  const pixelCounts = new Array<number>(colors.length).fill(0)
  for (let i = 0; i < labels.length; i++) {
    pixelCounts[labels[i]!]++
  }
  const palette = buildPalette({
    colors,
    pixelCounts,
    totalPixels: image.width * image.height,
  })

  return {
    width: image.width,
    height: image.height,
    palette,
    labels,
    regionIds: ids,
    regions,
    config,
  }
}
