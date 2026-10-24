import type { DecodedImage, PaintByNumberResult } from '@/interfaces'
import { PaintingCanvas } from '@/components/PaintingCanvas'
import {
  Container,
  DividerHandle,
  DividerLine,
  PaintedLayer,
  Tag,
} from '@/components/ImageComparator/ImageComparator.styles'
import { useImageComparator } from '@/components/ImageComparator/useImageComparator'

export interface ImageComparatorProps {
  image: DecodedImage
  result: PaintByNumberResult
}

function HandleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M6.5 3.5L3 8l3.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 3.5L13 8l-3.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Comparador interactivo: original debajo, lámina a la derecha del divisor.
 * El divisor se mueve con mouse, tacto y teclado (flechas/Home/End).
 */
export function ImageComparator({ image, result }: ImageComparatorProps) {
  const comparator = useImageComparator()
  const aspectRatio = `${result.width} / ${result.height}`

  return (
    <Container
      ref={comparator.containerRef}
      $aspectRatio={aspectRatio}
      {...comparator.surfaceProps}
      data-testid="comparator"
    >
      <img
        src={image.originalUrl}
        alt="Imagen original"
        draggable={false}
        width={result.width}
        height={result.height}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <PaintedLayer style={{ clipPath: `inset(0 0 0 ${comparator.positionPct}%)` }}>
        <PaintingCanvas result={result} stretch />
      </PaintedLayer>

      <DividerLine $positionPct={comparator.positionPct} />
      <DividerHandle
        {...comparator.handleProps}
        style={{ left: `${comparator.positionPct}%` }}
      >
        <HandleGlyph />
      </DividerHandle>

      <Tag $align="left">Original</Tag>
      <Tag $align="right">Pintura por números</Tag>
    </Container>
  )
}
