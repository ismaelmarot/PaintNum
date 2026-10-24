/** Render de la lámina de pintura por números sobre un canvas (capa fina sobre el núcleo puro). */

import type { PaintByNumberResult } from '@/interfaces/pbn'

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif'

export interface PaintingRenderOptions {
  /** Píxeles de salida por píxel de la imagen de trabajo. */
  scale: number
  showContours?: boolean
  showNumbers?: boolean
  /** Tamaño mínimo de glifo (px de salida) para aceptar el número de una región. */
  minNumberFontPx?: number
}

export interface NumberPlacement {
  x: number
  y: number
  fontSize: number
  text: string
  fill: string
  stroke: string
}

/** Lámina lista para pintar: relleno uniforme blanco, contornos grises y
 *  números oscuros. Los colores viven SOLO en la tabla. */
export const PLATE_BACKGROUND = { r: 255, g: 255, b: 255 } as const

/** Contorno (línea guía para pintar con los números). */
export const PLATE_CONTOUR = 'rgba(60, 60, 67, 0.85)' as const

/** Número siempre oscuro (fondo blanco garantiza contraste). */
export const PLATE_NUMBER_FILL = '#1d1d1f' as const

/** Buffer RGBA 1:1: fondo blanco puro en cada píxel de la lámina. */
export function composePaintingImageData(
  result: PaintByNumberResult,
): { width: number; height: number; data: Uint8ClampedArray } {
  const { width, height } = result
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const o = i * 4
    data[o] = PLATE_BACKGROUND.r
    data[o + 1] = PLATE_BACKGROUND.g
    data[o + 2] = PLATE_BACKGROUND.b
    data[o + 3] = 255
  }
  return { width, height, data }
}

/** Tope proporcional del glifo: 6% del lado mayor → números bien chicos,
 *  aunque la región sea enorme (fondo completo). */
export const NUMBER_MAX_FONT_FRACTION = 0.06

export function defaultMaxFontPx(
  result: Pick<PaintByNumberResult, 'width' | 'height'>,
  scale: number,
): number {
  const longest = Math.max(result.width, result.height)
  return longest * scale * NUMBER_MAX_FONT_FRACTION
}

/**
 * Posiciones legibles de los números: centroide de la región si el glifo cabe
 * con margen en la envolvente y no supera el tope proporcional. Puro y comprobable.
 */
export function computeNumberPlacements(
  result: PaintByNumberResult,
  scale: number,
  minFontPx: number,
  maxFontPx = defaultMaxFontPx(result, scale),
): NumberPlacement[] {
  const placements: NumberPlacement[] = []
  for (const region of result.regions) {
    const paletteColor = result.palette[region.colorIndex]
    const text = String(paletteColor.number)
    const boundW = (region.bounds.xmax - region.bounds.xmin) * scale
    const boundH = (region.bounds.ymax - region.bounds.ymin) * scale
    if (boundH <= 0 || boundW <= 0) continue

    // El glifo debe caber con holgura en ambas dimensiones y respetar el tope.
    const fontByHeight = boundH * 0.35
    const fontByWidth = boundW / (text.length * 0.62 + 0.4)
    const fontSize = Math.min(fontByHeight, fontByWidth, maxFontPx)
    if (fontSize < minFontPx || fontSize <= 0) continue

    placements.push({
      x: region.centroid.x * scale,
      y: region.centroid.y * scale,
      fontSize,
      text,
      fill: PLATE_NUMBER_FILL,
      stroke: 'rgba(255, 255, 255, 0.85)',
    })
  }
  return placements
}

/**
 * Contornos: fronteras de 4-conectividad entre etiquetas distintas, como un
 * único path de rects finos para una sola pasada de fill.
 */
function drawContours(
  ctx: CanvasRenderingContext2D,
  result: PaintByNumberResult,
  scale: number,
): void {
  const { width, height, labels } = result
  ctx.fillStyle = PLATE_CONTOUR
  ctx.beginPath()
  const line = Math.max(1, scale)
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width
    for (let x = 0; x < width; x++) {
      const p = rowOffset + x
      const label = labels[p]
      // Frontera vertical con el vecino derecho.
      if (x + 1 < width && labels[p + 1] !== label) {
        ctx.rect((x + 1) * scale - line / 2, y * scale, line, scale + line / 2)
      }
      // Frontera horizontal con el vecino inferior.
      if (y + 1 < height && labels[p + width] !== label) {
        ctx.rect(x * scale, (y + 1) * scale - line / 2, scale + line / 2, line)
      }
      // Borde exterior del lienzo.
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        if (x === 0) ctx.rect(0, y * scale, line, scale)
        if (x === width - 1) ctx.rect(outRight(width, scale) - line, y * scale, line, scale)
        if (y === 0) ctx.rect(x * scale, 0, scale, line)
        if (y === height - 1) {
          ctx.rect(x * scale, outRight(height, scale) - line, scale, line)
        }
      }
    }
  }
  ctx.fill()
}

function outRight(size: number, scale: number): number {
  return size * scale
}

/**
 * Dibuja la lámina completa (relleno + contornos + números) en el contexto dado.
 * El canvas debe estar dimensionado a `(width × height) * scale`.
 */
export function drawPainting(
  ctx: CanvasRenderingContext2D,
  result: PaintByNumberResult,
  options: PaintingRenderOptions,
): void {
  const { scale } = options
  const showContours = options.showContours ?? true
  const showNumbers = options.showNumbers ?? true
  const minNumberFontPx = options.minNumberFontPx ?? Math.max(6, scale * 7)

  const outW = result.width * scale
  const outH = result.height * scale

  ctx.clearRect(0, 0, outW, outH)

  // Relleno por bloques: reconstrucción a resolución de trabajo y escalado
  // nearest-neighbor para bloques nítidos.
  const rawImageData = composePaintingImageData(result)
  const imageData = new ImageData(
    new Uint8ClampedArray(rawImageData.data),
    rawImageData.width,
    rawImageData.height,
  )
  if (scale === 1) {
    ctx.putImageData(imageData, 0, 0)
  } else {
    const staging = document.createElement('canvas')
    staging.width = result.width
    staging.height = result.height
    const stagingCtx = staging.getContext('2d')
    if (!stagingCtx) throw new Error('Canvas 2D no disponible')
    stagingCtx.putImageData(imageData, 0, 0)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(staging, 0, 0, outW, outH)
  }

  if (showContours) {
    drawContours(ctx, result, scale)
  }

  if (showNumbers) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    for (const placement of computeNumberPlacements(result, scale, minNumberFontPx)) {
      ctx.font = `600 ${placement.fontSize}px ${FONT_STACK}`
      ctx.lineWidth = Math.max(1, placement.fontSize * 0.12)
      ctx.strokeStyle = placement.stroke
      ctx.strokeText(placement.text, placement.x, placement.y)
      ctx.fillStyle = placement.fill
      ctx.fillText(placement.text, placement.x, placement.y)
    }
  }
}
