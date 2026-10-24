import { useCallback, useState } from 'react'
import type { DecodedImage, PaintByNumberResult, PaperConfig } from '@/interfaces'
import { canvasToBlob, originalCanvas, paintingCanvas } from '@/utils/exporting/canvases'
import { downloadBlob, buildExportZip } from '@/utils/exporting/exportZip'
import { buildPaintingPdf } from '@/utils/exporting/paintingPdf'

export type ExportKind = 'pdf' | 'zip'

export interface ExportManager {
  busyKind: ExportKind | null
  error: string | null
  canExport: boolean
  /** Nombre elegido por el usuario (sanitizado) para el archivo descargado. */
  filename: string
  setFilename: (raw: string) => void
  runExport: (kind: ExportKind) => Promise<void>
  clearError: () => void
}

export interface ExportInput {
  image?: DecodedImage
  result?: PaintByNumberResult
  paper: PaperConfig
}

export const DEFAULT_EXPORT_NAME = 'paintnum'

/** Sanitiza el nombre para filename: sin \ / : * ? " < > | ni espacios extras. */
export function sanitizeFilename(raw: string): string {
  const cleaned = raw.replace(/[\\/:*?"<>|]/g, '').trim()
  return cleaned.length > 0 ? cleaned : DEFAULT_EXPORT_NAME
}

/** Lógica de exportación: PDF y ZIP con estados y limpieza de recursos. */
export function useExportManager(input: ExportInput): ExportManager {
  const [busyKind, setBusyKind] = useState<ExportKind | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filename, setFilenameState] = useState(DEFAULT_EXPORT_NAME)
  const canExport =
    input.image !== undefined && input.result !== undefined

  const setFilename = useCallback((raw: string) => {
    setFilenameState(sanitizeFilename(raw))
  }, [])

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
            `${filename}.pdf`,
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
          downloadBlob(zipBlob, `${filename}.zip`)
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
    [busyKind, canExport, filename, input],
  )

  return {
    busyKind,
    error,
    canExport,
    filename,
    setFilename,
    runExport,
    clearError: useCallback(() => setError(null), []),
  }
}
