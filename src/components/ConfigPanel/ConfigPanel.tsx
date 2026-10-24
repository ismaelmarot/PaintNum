import type { PaperConfig } from '@/interfaces/printing'
import type {
  PaperSizeId,
  WorkspaceConfig,
} from '@/interfaces'
import {
  CUSTOM_PAPER_LIMITS,
  PRINTING_DEFAULTS,
  PAPER_SIZES_MM,
  resolvePaperSizeMm,
} from '@/config/printing'
import { DETAIL_PRESETS, PROCESSING_LIMITS } from '@/config/processing'
import type { DetailPresetId } from '@/interfaces'
import {
  Label,
  LabelRow,
  Panel,
  PanelGroup,
  SegmentedButton,
  SegmentedControl,
  SizeFields,
  SizeInput,
  SizeWarning,
  Slider,
  ThresholdRange,
  ValueBadge,
} from '@/components/ConfigPanel/ConfigPanel.styles'

const PAPER_LABELS: Record<PaperSizeId, string> = {
  A5: 'A5',
  A4: 'A4',
  A3: 'A3',
  A2: 'A2',
  Letter: 'Carta',
  Legal: 'Oficio',
  Tabloid: 'Doble carta',
  Custom: 'Personalizado',
}

const DETAIL_LABELS: Record<DetailPresetId, string> = {
  ultrafine: 'Ultrafino',
  fine: 'Fino',
  balanced: 'Equilibrado',
  coarse: 'Grueso',
}

const ORIENTATION_LABELS = {
  portrait: 'Vertical',
  landscape: 'Horizontal',
} as const

const DEFAULT_CUSTOM_SIZE = { width: 200, height: 300 } as const

/** Mantiene el otro lado intacto mientras se escribe el actual. */
function applyCustomSize(
  paper: PaperConfig,
  side: 'width' | 'height',
  value: number,
): PaperConfig {
  const base = paper.customSize ?? { ...DEFAULT_CUSTOM_SIZE }
  const next = { ...base, [side]: Number.isFinite(value) ? value : base[side] }
  return { ...paper, customSize: next }
}

export interface ConfigPanelProps {
  config: WorkspaceConfig
  onConfigChange: (patch: Partial<WorkspaceConfig>) => void
  disabled?: boolean
}

/** Panel de configuración de la lámina: colores, detalle, papel y orientación. */
export function ConfigPanel({ config, onConfigChange, disabled = false }: ConfigPanelProps) {
  const detailPreset = DETAIL_PRESETS[config.detail]

  return (
    <Panel aria-label="Configuración de la lámina">
      <PanelGroup>
        <LabelRow>
          <Label htmlFor="colors-range">Cantidad de colores</Label>
          <ValueBadge>{config.colorCount}</ValueBadge>
        </LabelRow>
        <Slider
          id="colors-range"
          type="range"
          min={PROCESSING_LIMITS.minColors}
          max={PROCESSING_LIMITS.maxColors}
          step={1}
          value={config.colorCount}
          onChange={(event) =>
            onConfigChange({ colorCount: event.target.valueAsNumber })
          }
          disabled={disabled}
          aria-valuenow={config.colorCount}
          aria-valuemin={PROCESSING_LIMITS.minColors}
          aria-valuemax={PROCESSING_LIMITS.maxColors}
        />
        <ThresholdRange>
          {PROCESSING_LIMITS.minColors} (mín.) — {PROCESSING_LIMITS.maxColors} (máx.)
        </ThresholdRange>
      </PanelGroup>

      <PanelGroup>
        <LabelRow>
          <Label as="span" id="detail-label">
            Detalle (regiones chicas)
          </Label>
        </LabelRow>
        <SegmentedControl role="group" aria-labelledby="detail-label">
          {(Object.keys(DETAIL_PRESETS) as DetailPresetId[]).map((preset) => (
            <SegmentedButton
              key={preset}
              type="button"
              $selected={config.detail === preset}
              onClick={() => onConfigChange({ detail: preset })}
              disabled={disabled}
              aria-pressed={config.detail === preset}
            >
              {DETAIL_LABELS[preset]}
            </SegmentedButton>
          ))}
        </SegmentedControl>
        <ThresholdRange>
          Zonas de hasta {detailPreset.smallRegionMinPx} px se fusionan con su vecino.
        </ThresholdRange>
      </PanelGroup>

      <PanelGroup>
        <LabelRow>
          <Label as="span" id="paper-label">
            Tamaño de papel
          </Label>
          <ThresholdRange>
            {(() => {
              const resolved = resolvePaperSizeMm(config.paper)
              if (!resolved) return 'Definí ancho × alto en mm'
              return `${resolved.width}×${resolved.height} mm`
            })()}
          </ThresholdRange>
        </LabelRow>
        <SegmentedControl role="group" aria-labelledby="paper-label">
          {[...(Object.keys(PAPER_SIZES_MM) as Exclude<PaperSizeId, 'Custom'>[]), 'Custom' as PaperSizeId].map(
            (size) => (
              <SegmentedButton
                key={size}
                type="button"
                $selected={config.paper.paperSize === size}
                onClick={() =>
                  onConfigChange({
                    paper: {
                      ...config.paper,
                      paperSize: size,
                      ...(size === 'Custom' && !config.paper.customSize
                        ? { customSize: { width: 200, height: 300 } }
                        : {}),
                    },
                  })
                }
                disabled={disabled}
                aria-pressed={config.paper.paperSize === size}
              >
                {PAPER_LABELS[size]}
              </SegmentedButton>
            ),
          )}
        </SegmentedControl>
        {config.paper.paperSize === 'Custom' && (
          <SizeFields role="group" aria-label="Medida personalizada en milímetros">
            <SizeInput
              aria-label="Ancho personalizado en milímetros"
              type="number"
              min={CUSTOM_PAPER_LIMITS.minSideMm}
              max={CUSTOM_PAPER_LIMITS.maxSideMm}
              value={config.paper.customSize?.width ?? ''}
              onChange={(event) =>
                onConfigChange({
                  paper: applyCustomSize(config.paper, 'width', event.target.valueAsNumber),
                })
              }
              disabled={disabled}
            />
            ×
            <SizeInput
              aria-label="Alto personalizado en milímetros"
              type="number"
              min={CUSTOM_PAPER_LIMITS.minSideMm}
              max={CUSTOM_PAPER_LIMITS.maxSideMm}
              value={config.paper.customSize?.height ?? ''}
              onChange={(event) =>
                onConfigChange({
                  paper: applyCustomSize(config.paper, 'height', event.target.valueAsNumber),
                })
              }
              disabled={disabled}
            />
            mm
            {!resolvePaperSizeMm(config.paper) && (
              <SizeWarning role="alert">
                La medida debe estar entre {CUSTOM_PAPER_LIMITS.minSideMm} y{' '}
                {CUSTOM_PAPER_LIMITS.maxSideMm} mm.
              </SizeWarning>
            )}
          </SizeFields>
        )}
      </PanelGroup>

      <PanelGroup>
        <LabelRow>
          <Label as="span" id="orientation-label">
            Orientación
          </Label>
        </LabelRow>
        <SegmentedControl role="group" aria-labelledby="orientation-label">
          {(['portrait', 'landscape'] as const).map((orientation) => (
            <SegmentedButton
              key={orientation}
              type="button"
              $selected={config.paper.orientation === orientation}
              onClick={() =>
                onConfigChange({
                  paper: { ...config.paper, orientation },
                })
              }
              disabled={disabled}
              aria-pressed={config.paper.orientation === orientation}
            >
              {ORIENTATION_LABELS[orientation]}
            </SegmentedButton>
          ))}
        </SegmentedControl>
      </PanelGroup>

      <PanelGroup>
        <LabelRow>
          <Label htmlFor="margins-range">Márgenes</Label>
          <ValueBadge>{config.paper.marginsMm} mm</ValueBadge>
        </LabelRow>
        <Slider
          id="margins-range"
          type="range"
          min={PRINTING_DEFAULTS.minMarginsMm}
          max={PRINTING_DEFAULTS.maxMarginsMm}
          step={1}
          value={config.paper.marginsMm}
          onChange={(event) =>
            onConfigChange({
              paper: {
                ...config.paper,
                marginsMm: event.target.valueAsNumber,
              },
            })
          }
          disabled={disabled}
        />
      </PanelGroup>
    </Panel>
  )
}
