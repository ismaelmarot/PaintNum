import type { ImageUploaderResult } from '@/components/ImageUploader/useImageUploader'
import {
  DropZone,
  UploaderError,
  UploaderHint,
  UploaderIcon,
  UploaderTitle,
} from '@/components/ImageUploader/ImageUploader.styles'

export interface ImageUploaderViewProps {
  dragging: boolean
  processing: boolean
  error: string | null
  /** Texto orientativo bajo el título (formatos, límite de tamaño). */
  hint?: string
  onOpenPicker: () => void
  dragHandlers: ImageUploaderResult['dragHandlers']
}

/** Zona de carga: click, drag & drop y estados accesibles. */
export function ImageUploader({
  dragging,
  processing,
  error,
  hint,
  onOpenPicker,
  dragHandlers,
}: ImageUploaderViewProps) {
  return (
    <>
      <DropZone
        {...dragHandlers}
        onClick={onOpenPicker}
        disabled={processing}
        $dragging={dragging}
        $processing={processing}
        aria-disabled={processing}
        type="button"
      >
        <UploaderIcon>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="M5.5 17.5l4.2-4.2a1.6 1.6 0 0 1 2.2 0l3.6 3.6" />
            <path d="M14.5 15.5l1.8-1.8a1.6 1.6 0 0 1 2.2 0l2 2" />
          </svg>
        </UploaderIcon>
        <UploaderTitle>
          {processing ? 'Procesando…' : 'Arrastrá tu imagen o hacé click para elegirla'}
        </UploaderTitle>
        {hint && !processing && <UploaderHint>{hint}</UploaderHint>}
        {error && (
          <UploaderError role="alert">{error}</UploaderError>
        )}
      </DropZone>
    </>
  )
}
