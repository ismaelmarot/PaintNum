import { useCallback, useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { ExportActions } from '@/components/ExportActions'
import { useExportManager } from '@/components/ExportActions/useExportManager'
import { Footer } from '@/components/Footer'
import { ImageComparator } from '@/components/ImageComparator'
import { ImageUploader } from '@/components/ImageUploader'
import { useImageUploader } from '@/components/ImageUploader/useImageUploader'
import { ConfigPanel } from '@/components/ConfigPanel'
import { ColorPaletteTable } from '@/components/ColorPaletteTable'
import { ShareBar } from '@/components/ShareBar'
import { TopBar } from '@/components/TopBar'
import { AppPresentation } from '@/components/AppPresentation'
import { DETAIL_PRESETS, PROCESSING_LIMITS } from '@/config/processing'
import { PRINTING_DEFAULTS, suggestOrientation } from '@/config/printing'
import type {
  DecodedImage,
  PaintByNumberResult,
  WorkspaceConfig,
} from '@/interfaces'
import { releaseImage } from '@/utils/imageProcessing/loadImage'
import { generatePaintByNumbers } from '@/utils/imageProcessing/pipeline'
import { BaseStyles } from '@/styles/BaseStyles'
import { theme } from '@/styles/theme'
import {
  AppleButton,
  Dots,
  ErrorNote,
  Hero,
  HeroTitle,
  ProcessingNote,
  Section,
  SectionTitle,
  Stage,
  TableWrap,
  WorkspaceGrid,
} from '@/styles/App.styles'

type Status = 'idle' | 'processing' | 'success' | 'error'

function defaultWorkspaceConfig(): WorkspaceConfig {
  return {
    colorCount: PROCESSING_LIMITS.defaultColorCount,
    detail: 'balanced',
    showNumbers: true,
    showContours: true,
    paper: {
      paperSize: PRINTING_DEFAULTS.defaultPaperSize,
      orientation: 'portrait',
      marginsMm: PRINTING_DEFAULTS.defaultMarginsMm,
    },
  }
}

export function App() {
  const [image, setImage] = useState<DecodedImage | null>(null)
  const [config, setConfig] = useState<WorkspaceConfig>(defaultWorkspaceConfig)
  const [result, setResult] = useState<PaintByNumberResult | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [showPresentation, setShowPresentation] = useState(true)

  const handleImageLoaded = useCallback((loaded: DecodedImage) => {
    setImage((previous) => {
      if (previous) releaseImage(previous)
      return loaded
    })
    setConfig((previous) => ({
      ...previous,
      paper: {
        ...previous.paper,
        orientation: suggestOrientation(loaded.naturalWidth, loaded.naturalHeight),
      },
    }))
  }, [])

  const {
    isDragging,
    isProcessing: uploading,
    error,
    dragHandlers,
    openFilePicker,
    inputProps,
  } = useImageUploader(handleImageLoaded, PROCESSING_LIMITS)

  const handleConfigChange = useCallback(
    (patch: Partial<WorkspaceConfig>) => {
      setConfig((previous) => ({ ...previous, ...patch }))
    },
    [],
  )

  const exportManager = useExportManager({
    image: image ?? undefined,
    result: result ?? undefined,
    paper: config.paper,
  })

  // Generación: siempre a partir de la imagen original (nunca del resultado previo).
  useEffect(() => {
    if (!image) {
      setResult(null)
      setStatus('idle')
      return
    }
    let cancelled = false
    setStatus('processing')
    setStatusMessage(null)
    const timer = setTimeout(() => {
      if (cancelled) return
      try {
        const preset = DETAIL_PRESETS[config.detail]
        const generated = generatePaintByNumbers(image.work, {
          colorCount: config.colorCount,
          smallRegionRatio: preset.smallRegionRatio,
          smallRegionMinPx: preset.smallRegionMinPx,
          maxMergePasses: PROCESSING_LIMITS.maxMergePasses,
        })
        if (cancelled) return
        setResult(generated)
        setStatus('success')
      } catch (generationError) {
        if (cancelled) return
        setStatus('error')
        setStatusMessage(
          generationError instanceof Error
            ? generationError.message
            : 'No se pudo generar la lámina.',
        )
      }
    }, 180)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [image, config.colorCount, config.detail])

  // Pantalla de presentación: se muestra una vez al montar y se descarta tras ~4s.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPresentation(false)
    }, 4000)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <BaseStyles />
      <TopBar
        hasImage={image !== null}
      />
      {/* Input de archivo a nivel app: sobrevive al cambio hero→workspace,
          para que "Reemplazar imagen" funcione después de la primera carga. */}
      <input {...inputProps} aria-label="Seleccionar imagen" hidden />
      {showPresentation && <AppPresentation onDismiss={() => setShowPresentation(false)} />}
      <main style={{ flex: '1 1 auto', minHeight: 0 }}>
        {!image ? (
          <Hero>
            <HeroTitle>
              Convertí una foto en tu próxima pintura por números
            </HeroTitle>
            <ImageUploader
              dragging={isDragging}
              processing={uploading}
              error={error}
              hint={`PNG, JPEG o WebP · hasta ${Math.round(
                PROCESSING_LIMITS.maxFileBytes / (1024 * 1024),
              )} MB`}
              onOpenPicker={openFilePicker}
              dragHandlers={dragHandlers}
            />
          </Hero>
        ) : (
          <>
            <WorkspaceGrid>
              <Stage>
                {status === 'processing' && (
                  <ProcessingNote aria-live="polite">
                    <Dots aria-hidden="true" />
                    Generando lámina…
                  </ProcessingNote>
                )}
                {status === 'error' && (
                  <ErrorNote aria-live="assertive">
                    {statusMessage ?? 'No se pudo generar la lámina.'}
                  </ErrorNote>
                )}
                {result && <ImageComparator image={image} result={result} />}
              </Stage>
              <ConfigPanel config={config} onConfigChange={handleConfigChange} />
</WorkspaceGrid>

{result && (
              <Section>
                <AppleButton onClick={openFilePicker} aria-label="Reemplazar imagen">
                  Reemplazar imagen
                </AppleButton>
              </Section>
            )}

              {result && (
                <Section>
                  <SectionTitle as="h2">Tabla de colores</SectionTitle>
                  <TableWrap>
                    <ColorPaletteTable palette={result.palette} />
                  </TableWrap>
                </Section>
              )}
            {result && (
              <Section>
                <SectionTitle as="h2">Descargar</SectionTitle>
                <ExportActions manager={exportManager} />
              </Section>
            )}
            {result && (
              <Section>
                <SectionTitle as="h2">Compartir</SectionTitle>
                <ShareBar result={result} />
              </Section>
            )}
          </>
        )}
      </main>
      <Footer />
    </ThemeProvider>
  )
}
