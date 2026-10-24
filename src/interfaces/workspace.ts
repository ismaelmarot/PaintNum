/** Configuración del espacio de trabajo de la app. */

import type { PaperConfig } from '@/interfaces/printing'

/** Presets de detalle para el tratamiento de regiones pequeñas. */
export type DetailPresetId = 'ultrafine' | 'fine' | 'balanced' | 'coarse'

export interface WorkspaceConfig {
  /** Cantidad deseada de colores de la paleta. */
  colorCount: number
  /** Detalle del tratamiento de regiones pequeñas. */
  detail: DetailPresetId
  /** Números y contornos visibles en la lámina (preview e impresión). */
  showNumbers: boolean
  showContours: boolean
  /** Configuración de papel para la composición de los exports. */
  paper: PaperConfig
}
