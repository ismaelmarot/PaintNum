import { useCallback, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'

export interface ComparatorState {
  positionPct: number
  containerRef: React.RefObject<HTMLDivElement | null>
  handleProps: {
    role: 'slider'
    'aria-label': string
    'aria-valuemin': number
    'aria-valuemax': number
    'aria-valuenow': number
    tabIndex: 0
    onPointerDown: (event: PointerEvent) => void
    onPointerMove: (event: PointerEvent) => void
    onPointerUp: (event: PointerEvent) => void
    onKeyDown: (event: KeyboardEvent) => void
  }
  surfaceProps: {
    onPointerDown: (event: PointerEvent) => void
  }
}

const STEP_PCT = 2
const BIG_STEP_PCT = 8

/** Lógica del comparador: posición del divisor con mouse, tacto y teclado. */
export function useImageComparator(): ComparatorState {
  const [positionPct, setPositionPct] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const positionFromClientX = useCallback((clientX: number): number => {
    const container = containerRef.current
    if (!container) return 50
    const rect = container.getBoundingClientRect()
    if (rect.width === 0) return 50
    const pct = ((clientX - rect.left) / rect.width) * 100
    return Math.min(100, Math.max(0, pct))
  }, [])

  const moveHandler = useCallback(
    (event: PointerEvent) => {
      if (!isDragging) return
      // Touch: evita hacer scroll de la página mientras se arrastra.
      event.preventDefault()
      setPositionPct(positionFromClientX(event.clientX))
    },
    [isDragging, positionFromClientX],
  )

  const handleProps = {
    role: 'slider' as const,
    'aria-label': 'Divisor del comparador de imágenes',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': Math.round(positionPct),
    tabIndex: 0 as const,
    onPointerDown: useCallback((event: PointerEvent) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      setIsDragging(true)
    }, []),
    onPointerMove: moveHandler,
    onPointerUp: useCallback(() => {
      setIsDragging(false)
    }, []),
    onKeyDown: useCallback((event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setPositionPct((p) => Math.max(0, p - STEP_PCT))
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setPositionPct((p) => Math.min(100, p + STEP_PCT))
      } else if (event.key === 'Home') {
        event.preventDefault()
        setPositionPct(BIG_STEP_PCT)
      } else if (event.key === 'End') {
        event.preventDefault()
        setPositionPct(100 - BIG_STEP_PCT)
      }
    }, []),
  }

  return {
    positionPct,
    containerRef,
    handleProps,
    surfaceProps: {
      // Click en cualquier lugar de la imagen: mueve el divisor ahí.
      onPointerDown: useCallback(
        (event: PointerEvent) => {
          setPositionPct(positionFromClientX(event.clientX))
        },
        [positionFromClientX],
      ),
    },
  }
}
