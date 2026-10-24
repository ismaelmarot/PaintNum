import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImageUploader } from '@/components/ImageUploader'
import { useImageUploader } from '@/components/ImageUploader/useImageUploader'
import { PROCESSING_LIMITS } from '@/config/processing'
import { theme } from '@/styles/theme'
import type { DecodedImage } from '@/interfaces/loading'

vi.mock('@/utils/imageProcessing/loadImage', () => ({
  loadImageFile: vi.fn(),
}))

import { loadImageFile } from '@/utils/imageProcessing/loadImage'

const mockedLoad = vi.mocked(loadImageFile)

const fakeImage: DecodedImage = {
  originalUrl: 'blob:fake',
  work: { width: 4, height: 4, data: new Uint8ClampedArray(64) },
  naturalWidth: 800,
  naturalHeight: 600,
  bitmap: {} as ImageBitmap,
}

function Harness({ onImageLoaded }: { onImageLoaded: (image: DecodedImage) => void }) {
  const uploader = useImageUploader(onImageLoaded, PROCESSING_LIMITS)
  return (
    <ThemeProvider theme={theme}>
      {/* El input vive fuera del dropzone (a nivel app); así "Reemplazar
          imagen" sigue operativo cuando el uploader no está montado. */}
      <ImageUploader
        dragging={uploader.isDragging}
        processing={uploader.isProcessing}
        error={uploader.error}
        hint="PNG, JPEG o WebP · hasta 15 MB"
        onOpenPicker={uploader.openFilePicker}
        dragHandlers={uploader.dragHandlers}
      />
      <input {...uploader.inputProps} aria-label="Seleccionar imagen" hidden />
    </ThemeProvider>
  )
}

function selectFile(input: HTMLInputElement, file: File): void {
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  fireEvent.change(input)
  // El componente resetea el input; el cambio vuelve vacío para la próxima carga.
  Object.defineProperty(input, 'files', { value: [], configurable: true })
}

describe('ImageUploader', () => {
  beforeEach(() => {
    mockedLoad.mockReset()
  })

  it('permite elegir un archivo válido y notifica el resultado', async () => {
    const onLoaded = vi.fn()
    mockedLoad.mockResolvedValue(fakeImage)
    render(<Harness onImageLoaded={onLoaded} />)

    selectFile(
      document.querySelector<HTMLInputElement>('input[type=file]')!,
      new File(['png-bytes'], 'foto.png', { type: 'image/png' }),
    )

    await waitFor(() => expect(onLoaded).toHaveBeenCalledWith(fakeImage))
  })

  it('muestra el mensaje de error para formatos no admitidos', async () => {
    mockedLoad.mockRejectedValue(
      new Error('Formato no compatible. Usá PNG, JPEG o WebP.'),
    )
    render(<Harness onImageLoaded={vi.fn()} />)

    selectFile(
      document.querySelector<HTMLInputElement>('input[type=file]')!,
      new File(['x'], 'archivo.gif', { type: 'image/gif' }),
    )

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Formato no compatible'),
    )
  })

  it('drag & drop dispara el procesamiento del archivo soltado', async () => {
    mockedLoad.mockResolvedValue(fakeImage)
    const onLoaded = vi.fn()
    render(<Harness onImageLoaded={onLoaded} />)

    const dropzone = screen.getByRole('button')
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [new File(['jpg-bytes'], 'foto.jpg', { type: 'image/jpeg' })],
      },
    })
    await waitFor(() => expect(onLoaded).toHaveBeenCalledWith(fakeImage))
  })
})
