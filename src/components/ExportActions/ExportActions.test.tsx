import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ExportActions } from '@/components/ExportActions'
import { useExportManager } from '@/components/ExportActions/useExportManager'
import { PRINTING_DEFAULTS } from '@/config/printing'
import { theme } from '@/styles/theme'
import type { DecodedImage } from '@/interfaces/loading'
import type { PaintByNumberResult } from '@/interfaces/pbn'

const IMAGE: DecodedImage = {
  originalUrl: 'blob:fake',
  work: { width: 8, height: 4, data: new Uint8ClampedArray(8 * 4 * 4) },
  naturalWidth: 800,
  naturalHeight: 400,
  bitmap: {} as ImageBitmap,
}

const RESULT: PaintByNumberResult = {
  width: 8,
  height: 4,
  palette: [
    { number: 1, index: 0, color: { r: 220, g: 30, b: 30 }, pixelCount: 16, coverage: 0.5 },
    { number: 2, index: 1, color: { r: 30, g: 40, b: 220 }, pixelCount: 16, coverage: 0.5 },
  ],
  labels: new Uint8Array(32).fill(0),
  regionIds: new Int32Array(32).fill(0),
  regions: [],
  config: {
    colorCount: 4,
    smallRegionRatio: 0.002,
    smallRegionMinPx: 0,
    maxMergePasses: 2,
  },
}

const PAPER = {
  paperSize: 'A4' as const,
  orientation: 'portrait' as const,
  marginsMm: PRINTING_DEFAULTS.defaultMarginsMm,
}

vi.mock('@/utils/exporting/canvases', () => ({
  originalCanvas: vi.fn(() => ({ toDataURL: () => 'data:image/png;base64,x', width: 8, height: 4 })),
  paintingCanvas: vi.fn(() => ({ toDataURL: () => 'data:image/png;base64,x', width: 8, height: 4 })),
  canvasToBlob: vi.fn(async () => new Blob(['png'])),
  pageDimensionsMm: vi.fn(() => ({ widthMm: 210, heightMm: 297 })),
  exportScale: vi.fn(() => 1),
}))

vi.mock('@/utils/exporting/paintingPdf', () => ({
  buildPaintingPdf: vi.fn(() => ({ output: () => new Blob(['pdf']) })),
}))

vi.mock('@/utils/exporting/exportZip', () => ({
  buildExportZip: vi.fn(async () => new Blob(['zip'])),
  downloadBlob: vi.fn(),
  ZIP_FILE_NAMES: {
    original: 'imagen-original.png',
    painting: 'pintura-por-numeros.png',
    csv: 'tabla-de-colores.csv',
    pdf: 'paintnum-preparado-para-imprimir.pdf',
  },
}))

import { downloadBlob } from '@/utils/exporting/exportZip'
import { buildPaintingPdf } from '@/utils/exporting/paintingPdf'

function Harness() {
  const manager = useExportManager({ image: IMAGE, result: RESULT, paper: PAPER })
  return (
    <ThemeProvider theme={theme}>
      <ExportActions manager={manager} />
    </ThemeProvider>
  )
}

describe('ExportActions', () => {
  beforeEach(() => {
    vi.mocked(downloadBlob).mockClear()
    vi.mocked(buildPaintingPdf).mockClear()
  })

  it('descarga el PDF y refleja el estado generando', async () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Descargar PDF' }))

    await waitFor(() => expect(downloadBlob).toHaveBeenCalled())
    expect(buildPaintingPdf).toHaveBeenCalledWith(
      expect.objectContaining({ paper: expect.objectContaining({ paperSize: 'A4' }) }),
    )
    expect(screen.queryByText('Generando archivo…')).not.toBeInTheDocument()
  })

  it('descarga el ZIP con los archivos esperados', async () => {
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Descargar ZIP' }))
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled())
  })

  it('libera el estado de error si la exportación falla', async () => {
    vi.mocked(buildPaintingPdf).mockImplementation(() => {
      throw new Error('Fallo de PDF')
    })
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Descargar PDF' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Fallo de PDF')
  })
})
