/** PDF de impresión: imagen original + lámina + tabla completa de colores. */

import { jsPDF } from 'jspdf'
import type { PaintByNumberResult } from '@/interfaces/pbn'
import type { PaperConfig } from '@/interfaces/printing'
import { pageDimensionsMm } from '@/utils/exporting/canvases'
import { hexFrom } from '@/interfaces/image'

const LINE_HEIGHT_MM = 6.4
const TABLE_FONT_SIZE = 9
const TITLE_FONT_SIZE = 12
const COLUMN_MM = [10, 12, 26, 30, 44, 22] as const

export interface PdfDocInput {
  result: PaintByNumberResult
  paper: PaperConfig
  originalCanvas: HTMLCanvasElement
  paintingCanvas: HTMLCanvasElement
}

/** Ajusta el aspect ratio de un canvas al rectángulo de contenido (centrado). */
export function fitRect(
  canvasWidth: number,
  canvasHeight: number,
  contentWidth: number,
  contentHeight: number,
): { x: number; y: number; w: number; h: number } {
  const scale = Math.min(contentWidth / canvasWidth, contentHeight / canvasHeight)
  const w = canvasWidth * scale
  const h = canvasHeight * scale
  return {
    x: (contentWidth - w) / 2,
    y: (contentHeight - h) / 2,
    w,
    h,
  }
}

function orientationFor(widthMm: number, heightMm: number): 'landscape' | 'portrait' {
  return widthMm >= heightMm ? 'landscape' : 'portrait'
}

function columnX(margin: number, index: number): number {
  let x = margin
  for (let i = 0; i < index; i++) x += COLUMN_MM[i] as number
  return x
}

const HEADER_TEXT = ['N°', '', 'HEX', 'RGB', 'RGBA', 'Superficie']

/** Genera el documento PDF completo (imágenes en todas las páginas del papel elegido). */
export function buildPaintingPdf(input: PdfDocInput): jsPDF {
  const { paper, result } = input
  const { widthMm, heightMm } = pageDimensionsMm(paper)
  const orientation = orientationFor(widthMm, heightMm)
  const doc = new jsPDF({
    unit: 'mm',
    format: [widthMm, heightMm],
    orientation,
  })
  const marginX = paper.marginsMm
  const marginRight = widthMm - marginX * 2
  const contentHeight = heightMm - paper.marginsMm * 2

  // Página 1: imagen original
  {
    const rect = fitRect(
      input.originalCanvas.width,
      input.originalCanvas.height,
      marginRight,
      contentHeight,
    )
    doc.addImage(
      input.originalCanvas.toDataURL('image/png'),
      'PNG',
      marginX + rect.x,
      paper.marginsMm + rect.y,
      rect.w,
      rect.h,
    )
  }

  // Página 2: lámina de pintura por números
  doc.addPage([widthMm, heightMm], orientation)
  {
    const rect = fitRect(
      input.paintingCanvas.width,
      input.paintingCanvas.height,
      marginRight,
      contentHeight,
    )
    doc.addImage(
      input.paintingCanvas.toDataURL('image/png'),
      'PNG',
      marginX + rect.x,
      paper.marginsMm + rect.y,
      rect.w,
      rect.h,
    )
  }

  // Páginas 3..n: tabla completa (con paginación si excede una hoja)
  let nextRow = 0
  while (nextRow < result.palette.length) {
    doc.addPage([widthMm, heightMm], orientation)
    nextRow = drawTablePage(doc, result, marginX, marginRight, nextRow, contentHeight)
  }

  return doc
}

/** Dibuja una página de la tabla; devuelve el índice de la próxima fila pendiente. */
export function drawTablePage(
  doc: jsPDF,
  result: PaintByNumberResult,
  marginX: number,
  contentWidth: number,
  startRow: number,
  contentHeight: number,
): number {
  doc.setTextColor(110, 110, 115)
  doc.setFontSize(TITLE_FONT_SIZE)
  doc.text('Tabla de colores', marginX, marginX + LINE_HEIGHT_MM * 0.8)

  const tableTop = marginX + LINE_HEIGHT_MM * 2.2
  doc.setFontSize(TABLE_FONT_SIZE)

  let y = tableTop
  for (let column = 0; column < HEADER_TEXT.length; column++) {
    const text = (HEADER_TEXT[column] ?? '').trim()
    if (text) doc.text(text, columnX(marginX, column), y)
  }
  y += LINE_HEIGHT_MM * 0.8
  doc.setDrawColor(210, 210, 215)
  doc.line(marginX, y - 2.4, marginX + contentWidth, y - 2.4)

  const maxRows = Math.floor((contentHeight - (y - marginX)) / LINE_HEIGHT_MM) - 1
  let rowsDrawn = 0
  let rowIndex = startRow

  while (rowIndex < result.palette.length && rowsDrawn < maxRows) {
    const pick = result.palette[rowIndex]

    doc.setTextColor(30, 30, 32)
    doc.text(String(pick.number), columnX(marginX, 0), y)
    doc.text(hexFrom(pick.color), columnX(marginX, 2), y)
    doc.text(`${pick.color.r}, ${pick.color.g}, ${pick.color.b}`, columnX(marginX, 3), y)
    doc.text(
      `rgba(${pick.color.r}, ${pick.color.g}, ${pick.color.b}, 1)`,
      columnX(marginX, 4),
      y,
    )
    doc.text(`${(pick.coverage * 100).toFixed(1)} %`, columnX(marginX, 5), y)

    // Muestra impresa como rectángulo relleno con borde.
    doc.setFillColor(pick.color.r, pick.color.g, pick.color.b)
    doc.setDrawColor(120)
    doc.rect(columnX(marginX, 1), y - 3.2, COLUMN_MM[1] as number - 2, 4.2, 'FD')

    y += LINE_HEIGHT_MM
    rowsDrawn++
    rowIndex++
  }

  return rowIndex
}
