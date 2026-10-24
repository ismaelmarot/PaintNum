/** ZIP: imagen original + lámina + tabla CSV + PDF de impresión. */

import JSZip from 'jszip'
import type { DecodedImage, PaintByNumberResult } from '@/interfaces'
import type { PaperConfig } from '@/interfaces/printing'
import { buildPaletteCsv } from '@/utils/exporting/paletteCsv'
import { buildPaintingPdf, type PdfDocInput } from '@/utils/exporting/paintingPdf'

export const ZIP_FILE_NAMES = {
  original: 'imagen-original.png',
  painting: 'pintura-por-numeros.png',
  csv: 'tabla-de-colores.csv',
  pdf: 'paintnum-preparado-para-imprimir.pdf',
} as const

export interface ZipOptions {
  image: DecodedImage
  result: PaintByNumberResult
  paper: PaperConfig
  originalCanvas: HTMLCanvasElement
  paintingCanvas: HTMLCanvasElement
  paintingBlob: Blob
}

/** Genera el ZIP completo y devuelve el blob listo para descargar. */
export async function buildExportZip(zipOptions: ZipOptions): Promise<Blob> {
  const zip = new JSZip()

  const originalFile = await fetch(zipOptions.image.originalUrl).then((response) => {
    if (!response.ok) throw new Error('No se pudo leer la imagen original.')
    return response.blob()
  })
  const ext = originalExtension(zipOptions.image.originalUrl)
  zip.file(`imagen-original.${ext}`, originalFile)
  zip.file(ZIP_FILE_NAMES.painting, zipOptions.paintingBlob)
  zip.file(ZIP_FILE_NAMES.csv, buildPaletteCsv(zipOptions.result.palette))

  const pdfInput: PdfDocInput = {
    result: zipOptions.result,
    paper: zipOptions.paper,
    originalCanvas: zipOptions.originalCanvas,
    paintingCanvas: zipOptions.paintingCanvas,
  }
  const pdf = buildPaintingPdf(pdfInput)
  zip.file(ZIP_FILE_NAMES.pdf, pdf.output('blob'))

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

function originalExtension(url: string): string {
  const clean = url.split(/[?#]/)[0] ?? ''
  const candidate = clean.split('.').pop() ?? ''
  return ['png', 'jpg', 'jpeg', 'webp'].includes(candidate.toLowerCase())
    ? candidate.toLowerCase()
    : 'png'
}

/** Descarga genérica al home del navegador sin almacenamiento permanente. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}
