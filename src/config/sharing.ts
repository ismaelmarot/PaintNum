/** Capacidades reales de compartición para la lámina generada. */

export interface ShareIntent {
  /** Red o mecanismo. */
  id: ShareTargetId
  label: string
  /** URL de intent con marcador {text} y/o {url}. */
  intentTemplate?: string
}

export type ShareTargetId = 'whatsapp' | 'telegram' | 'x' | 'pinterest' | 'facebook' | 'instagram' | 'native' | 'copy'

/**
 * Enlaces oficiales de compartir (sin APIs privadas ni OAuth).
 * Instagram no expone intent de publicación web: se resuelve con descarga + guía.
 */
export const SHARE_INTENTS: ShareIntent[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    intentTemplate: 'https://wa.me/?text={text}',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    intentTemplate: 'https://t.me/share/url?url={url}&text={text}',
  },
  {
    id: 'x',
    label: 'X',
    intentTemplate: 'https://twitter.com/intent/tweet?text={text}&url={url}',
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    intentTemplate: 'https://pinterest.com/pin/create/button/?url={url}&description={text}',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    intentTemplate: 'https://www.facebook.com/sharer/sharer.php?u={url}&quote={text}',
  },
]

const MESSAGE_BASE = 'Transformé mis fotos en pinturas por números con PaintNum:'

/** Construye el texto del mensaje según exista URL pública o no. */
export function shareMessage(pageUrl: string): string {
  const isLocal = /localhost|127\.0\.0\.1/.test(pageUrl)
  if (isLocal) {
    return `${MESSAGE_BASE} (estoy ejecutando la app localmente, la URL no es pública todavía) ${pageUrl}`
  }
  return `${MESSAGE_BASE} ${pageUrl}`
}

/** Rellena el template del intent con url/texto codificados (encodeURIComponent). */
export function buildIntentUrl(intent: ShareIntent, pageUrl: string): string | null {
  if (!intent.intentTemplate) return null
  const text = shareMessage(pageUrl)
  return intent.intentTemplate
    .replace('{url}', encodeURIComponent(pageUrl))
    .replace('{text}', encodeURIComponent(text))
}

/** ¿El navegador soporta compartir archivos? (Web Share API Level 2). */
export function canShareFiles(navigatorLike: Navigator): boolean {
  const canShare = navigatorLike.canShare?.bind(navigatorLike)
  if (!canShare) return false
  try {
    return canShare({ files: [new File(['probe'], 'probe.png', { type: 'image/png' })] })
  } catch {
    return false
  }
}
