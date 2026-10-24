import { fireEvent, render, screen, act } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it } from 'vitest'
import { ImageComparator } from '@/components/ImageComparator'
import { theme } from '@/styles/theme'
import {
  solidSplitImage,
} from '@/utils/imageProcessing/__fixtures__/images'
import { generatePaintByNumbers } from '@/utils/imageProcessing/pipeline'
import type { DecodedImage } from '@/interfaces/loading'
import type { GenerationConfig } from '@/interfaces/pbn'

const CONFIG: GenerationConfig = {
  colorCount: 4,
  smallRegionMinPx: 0,
  smallRegionRatio: 0,
  maxMergePasses: 2,
}

const IMAGE: DecodedImage = {
  originalUrl: 'blob:fake',
  work: { width: 8, height: 4, data: new Uint8ClampedArray(8 * 4 * 4) },
  naturalWidth: 800,
  naturalHeight: 400,
  bitmap: {} as ImageBitmap,
}

function setup() {
  const image = solidSplitImage()
  const result = generatePaintByNumbers(image, CONFIG)
  const styledImage = { ...IMAGE, originalUrl: 'blob:original' }
  render(
    <ThemeProvider theme={theme}>
      <ImageComparator image={styledImage} result={result} />
    </ThemeProvider>,
  )
  return { result }
}

describe('ImageComparator', () => {
  it('muestra original y lámina con etiquetas y divisor accesible', () => {
    setup()
    expect(screen.getByAltText('Imagen original')).toBeInTheDocument()
    expect(screen.getByText('Pintura por números')).toBeInTheDocument()
    expect(screen.getByText('Original')).toBeInTheDocument()

    const handle = screen.getByRole('slider', {
      name: 'Divisor del comparador de imágenes',
    })
    expect(handle).toHaveAttribute('aria-valuemin', '0')
    expect(handle).toHaveAttribute('aria-valuemax', '100')
    expect(handle).toHaveAttribute('aria-valuenow', '50')
  })

  it('el teclado mueve el divisor: flechas y Home/End', () => {
    setup()
    const handle = screen.getByRole('slider', {
      name: 'Divisor del comparador de imágenes',
    })

    fireEvent.keyDown(handle, { key: 'ArrowLeft' })
    expect(handle).toHaveAttribute('aria-valuenow', '48')
    fireEvent.keyDown(handle, { key: 'ArrowRight' })
    expect(handle).toHaveAttribute('aria-valuenow', '50')
    for (let i = 0; i < 20; i++) {
      fireEvent.keyDown(handle, { key: 'ArrowRight' })
    }
    expect(handle).toHaveAttribute('aria-valuenow', '90')
    fireEvent.keyDown(handle, { key: 'End' })
    expect(handle).toHaveAttribute('aria-valuenow', '92')
    fireEvent.keyDown(handle, { key: 'Home' })
    expect(handle).toHaveAttribute('aria-valuenow', '8')
  })

  it('el click en la imagen mueve el divisor a esa posición (sin exceder límites)', () => {
    setup()
    const surface = screen.getByTestId('comparator')

    Object.defineProperty(surface, 'getBoundingClientRect', {
      value: () => ({ left: 0, width: 200 } as DOMRect),
      configurable: true,
    })

    act(() => {
      fireEvent.pointerDown(surface, { clientX: 50 })
    })
    const handle = screen.getByRole('slider', {
      name: 'Divisor del comparador de imágenes',
    })
    expect(handle).toHaveAttribute('aria-valuenow', '25')

    act(() => {
      fireEvent.pointerDown(surface, { clientX: 999 })
    })
    expect(handle).toHaveAttribute('aria-valuenow', '100')

    act(() => {
      fireEvent.pointerDown(surface, { clientX: -999 })
    })
    expect(handle).toHaveAttribute('aria-valuenow', '0')
  })

  it('las proporciones se conservan entre original y lámina', () => {
    setup()
    expect(IMAGE.naturalWidth / IMAGE.naturalHeight).toBe(2)
  })
})
