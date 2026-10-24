import { useEffect, useRef } from 'react'
import type { PaintByNumberResult } from '@/interfaces'
import { drawPainting } from '@/utils/imageProcessing/renderPainting'
import { Wrapper } from '@/components/PaintingCanvas/PaintingCanvas.styles'

export interface PaintingCanvasProps {
  result: PaintByNumberResult
  /** Escala de render (px de salida por px de trabajo); 1 = resolución de trabajo. */
  scale?: number
  /** true = llena el contenedor (para superponer en el comparador). */
  stretch?: boolean
}

/** Canvas con la lámina generada (relleno + contornos + números). */
export function PaintingCanvas({ result, scale = 1, stretch = false }: PaintingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = result.width * scale
    canvas.height = result.height * scale
    drawPainting(ctx, result, { scale })
  }, [result, scale])

  return (
    <Wrapper
      ref={canvasRef}
      $stretch={stretch}
      role="img"
      aria-label="Lámina de pintura por números generada"
      data-testid="painting-canvas"
    />
  )
}
