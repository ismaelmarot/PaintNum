import { useCallback } from 'react'
import { canShareFiles } from '@/config/sharing'
import { paintingCanvas, canvasToBlob } from '@/utils/exporting/canvases'
import { downloadDataUrl } from '@/utils/exporting/exportZip'
import type { PaintByNumberResult } from '@/interfaces/pbn'

export interface SharingCommunicator {
  /** ¿Es posible compartir el archivo directamente con Web Share API? */
  nativeShareAvailable: boolean
  /** Copia la URL al portapapeles y devuelve el estado (éxito/limitación local). */
  copyLink: (url: string) => Promise<boolean>
  /** Web Share con el archivo de la lámina (si el navegador lo permite). */
  sharePaintingFiles: (result: PaintByNumberResult) => Promise<boolean>
  /** Descarga la lámina como PNG para publicarla manualmente (guía Instagram). */
  downloadPainting: (result: PaintByNumberResult) => Promise<void>
}

export function useSharing(
  navigatorLike: Navigator = window.navigator,
): SharingCommunicator {
  const nativeShareAvailable = canShareFiles(navigatorLike)

  const copyLink = useCallback(async (url: string): Promise<boolean> => {
    try {
      await navigatorLike.clipboard.writeText(url)
      return true
    } catch {
      return false
    }
  }, [navigatorLike])

  const sharePaintingFiles = useCallback(
    async (result: PaintByNumberResult): Promise<boolean> => {
      if (!navigatorLike.share || !canShareFiles(navigatorLike)) return false
      try {
        const canvas = paintingCanvas(result)
        const blob = await canvasToBlob(canvas)
        const file = new File([blob], 'pintura-por-numeros.png', { type: 'image/png' })
        await navigatorLike.share({ files: [file], title: 'PaintNum — pintura por números' })
        return true
      } catch (shareError) {
        // AbortError = el usuario canceló; no es un fallo real.
        if (shareError instanceof Error && shareError.name === 'AbortError') return true
        return false
      }
    },
    [navigatorLike],
  )

  const downloadPainting = useCallback(
    async (result: PaintByNumberResult) => {
      const canvas = paintingCanvas(result)
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        downloadDataUrl(url, 'pintura-por-numeros.png')
        URL.revokeObjectURL(url)
      }, 'image/png')
    },
    [],
  )

  return { nativeShareAvailable, copyLink, sharePaintingFiles, downloadPainting }
}
