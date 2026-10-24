import { useCallback, useRef, useState } from 'react'
import type { DecodedImage, LoadLimits } from '@/interfaces/loading'
import { loadImageFile } from '@/utils/imageProcessing/loadImage'

export interface ImageUploaderResult {
  isDragging: boolean
  isProcessing: boolean
  error: string | null
  clearError: () => void
  onFileSelected: (file: File | undefined) => void
  dragHandlers: {
    onDragOver: (event: React.DragEvent) => void
    onDragLeave: (event: React.DragEvent) => void
    onDrop: (event: React.DragEvent) => void
  }
  openFilePicker: () => void
  inputProps: {
    ref: React.RefObject<HTMLInputElement | null>
    type: 'file'
    accept: string
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  }
}

/** Lógica de carga: drag & drop, validación, decodificación y estados. */
export function useImageUploader(
  onImageLoaded: (image: DecodedImage) => void,
  limits: LoadLimits,
): ImageUploaderResult {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const onFileSelected = useCallback(
    (file: File | undefined) => {
      if (!file) return
      setIsProcessing(true)
      setError(null)
      // El decode es async para no bloquear el drop durante el procesamiento.
      void loadImageFile(file, limits)
        .then((image) => {
          onImageLoaded(image)
        })
        .catch((loadError: unknown) => {
          const message =
            loadError instanceof Error ? loadError.message : 'No se pudo procesar la imagen.'
          setError(message)
        })
        .finally(() => {
          setIsProcessing(false)
        })
    },
    [limits, onImageLoaded],
  )

  const dragHandlers = {
    onDragOver: useCallback((event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(true)
    }, []),
    onDragLeave: useCallback((event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
    }, []),
    onDrop: useCallback(
      (event: React.DragEvent) => {
        event.preventDefault()
        setIsDragging(false)
        const file = event.dataTransfer.files?.[0]
        onFileSelected(file)
      },
      [onFileSelected],
    ),
  }

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const accept = limits.acceptedMimeTypes.join(',')

  return {
    isDragging,
    isProcessing,
    error,
    clearError: useCallback(() => setError(null), []),
    onFileSelected,
    dragHandlers,
    openFilePicker,
    inputProps: {
      ref: inputRef,
      type: 'file',
      accept,
      onChange: useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0]
          onFileSelected(file)
          event.target.value = ''
        },
        [onFileSelected],
      ),
    },
  }
}
