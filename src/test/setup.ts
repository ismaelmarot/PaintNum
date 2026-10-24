import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom no implementa canvas: stub silencioso (el núcleo se prueba con ImageData puro).
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as never

// jsdom no soporta PointerEvent: polyfill mínimo para probar el comparador.
if (typeof window !== 'undefined' && typeof window.PointerEvent !== 'function') {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init)
      this.pointerId = init.pointerId ?? 0
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent
}

afterEach(() => {
  cleanup()
})
