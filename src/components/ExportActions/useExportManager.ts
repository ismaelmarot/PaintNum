import { useCallback, useState } from 'react'
import type { DecodedImage, PaintByNumberResult, PaperConfig } from '@/interfaces'
import { canvasToBlob, originalCanvas, paintingCanvas } from '@/utils/exporting/canvases'
import { downloadBlob, buildExportZip, ZIP_FILE_NAMES } from '@/utils/exporting/exportZip'
import { buildPaintingPdf } from '@/utils/exporting/paintingPdf'

export type ExportKind = 'pdf' | 'zip'

export interface ExportManager {
  busyKind: ExportKind | null
  error: string | null
  canExport: boolean
  runExport: (kind: ExportKind) => Promise<void>
  clearError: () => void
}

export interface ExportInput {
  image?: DecodedImage
  result?: PaintByNumberResult
  paper: PaperConfig
}

/** Lógica de exportación: PDF y ZIP con estados y limpieza de recursos. */
export function useExportManager(input: ExportInput): ExportManager {
  const [busyKind, setBusyKind] = useState<ExportKind | null>(null)
  const [error, setError] = useState<string | null>(null)
  const canExport =
    input.image !== undefined && input.result !== undefined

  const runExport = useCallback(
    async (kind: ExportKind) => {
      if (!canExport || busyKind || !input.image || !input.result) return
      setBusyKind(kind)
      setError(null)
      try {
        const original = originalCanvas(input.image)
        const painting = paintingCanvas(input.result)
        if (kind === 'pdf') {
          const doc = buildPaintingPdf({
            result: input.result,
            paper: input.paper,
            originalCanvas: original,
            paintingCanvas: painting,
          })
          // jsPDF: el blob incluye las páginas ya maquetadas.
          downloadBlob(
            doc.output('blob') as Blob,
            `paintnum-${input.paper.paperSize.toLowerCase()}.pdf`,
          )
        } else {
          const paintingBlob = await canvasToBlob(painting)
          const zipBlob = await buildExportZip({
            image: input.image,
            result: input.result,
            paper: input.paper,
            originalCanvas: original,
            paintingCanvas: painting,
            paintingBlob,
          })
          downloadBlob(zipBlob, `${ZIP_FILE_NAMES.painting.replace('.png', '')}.zip`)
        }
      } catch (exportError) {
        setError(
          exportError instanceof Error
            ? exportError.message
            : 'No se pudo generar el archivo.',
        )
      } finally {
        setBusyKind(null)
      }
    },
    [busyKind, canExport, input],
  )

  return {
    busyKind,
    error,
    canExport,
    runExport,
    clearError: useCallback(() => setError(null), []),
  }
}
