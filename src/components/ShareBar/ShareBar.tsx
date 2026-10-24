import { useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { SHARE_INTENTS, buildIntentUrl, canShareFiles, type ShareTargetId } from '@/config/sharing'
import { useSharing } from '@/components/ShareBar/useSharing'
import {
  CopyLinkIcon,
  DownloadIcon,
  FacebookIcon,
  PinterestIcon,
  ShareIcon,
  TelegramIcon,
  WhatsAppIcon,
  XIcon,
} from '@/components/ShareBar/icons'
import type { PaintByNumberResult } from '@/interfaces/pbn'
import {
  Bar,
  CopyFeedback,
  Guidance,
  LocalNotice,
  ShareButton,
  ShareSection,
} from '@/components/ShareBar/ShareBar.styles'

export interface ShareBarProps {
  result: PaintByNumberResult
}

const INSTAGRAM_GUIDANCE =
  'Instagram no permite publicar desde la web de manera automática: descargá la lámina y publicala desde la app de Instagram en tu dispositivo.'

function isLocalUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url)
}

/**
 * Compartir la lámina: SOLO iconos (con aria-label + title para acceso).
 * Web Share API (archivo), intents oficiales y descarga para Instagram.
 * Sin publicación automática ni OAuth.
 */
export function ShareBar({ result }: ShareBarProps) {
  const sharing = useSharing()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const pageUrl = window.location.href
  const local = isLocalUrl(pageUrl)

  const openIntent = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const onCopy = async () => {
    const copied = await sharing.copyLink(pageUrl)
    setCopyState(copied ? 'copied' : 'failed')
  }

  return (
    <ShareSection>
      <Bar aria-label="Compartir resultado" role="group">
        {sharing.nativeShareAvailable && canShareFiles(window.navigator) && (
          <ShareButton
            type="button"
            aria-label="Compartir con el sistema del dispositivo"
            title="Compartir con el sistema del dispositivo"
            onClick={() => void sharing.sharePaintingFiles(result)}
          >
            <ShareIcon />
          </ShareButton>
        )}

        {SHARE_INTENTS.map((intent) => {
          const url = buildIntentUrl(intent, pageUrl)
          if (!url) return null
          const IntentIcons: Partial<
            Record<ShareTargetId, ComponentType<SVGProps<SVGSVGElement>>>
          > = {
            whatsapp: WhatsAppIcon,
            telegram: TelegramIcon,
            x: XIcon,
            pinterest: PinterestIcon,
            facebook: FacebookIcon,
          }
          const Icon = IntentIcons[intent.id]
          if (!Icon) return null
          return (
            <ShareButton
              key={intent.id}
              type="button"
              aria-label={intent.label}
              title={`Compartir en ${intent.label}`}
              onClick={() => openIntent(url)}
            >
              <Icon />
            </ShareButton>
          )
        })}

        <ShareButton type="button" aria-label="Copiar enlace" title="Copiar enlace" onClick={onCopy}>
          <CopyLinkIcon />
        </ShareButton>
        <ShareButton
          type="button"
          aria-label="Instagram: descargar lámina"
          title="Instagram: descargar lámina"
          onClick={() => void sharing.downloadPainting(result)}
        >
          <DownloadIcon />
        </ShareButton>
      </Bar>

      {copyState === 'copied' && <CopyFeedback>Enlace copiado al portapapeles.</CopyFeedback>}
      {copyState === 'failed' && (
        <CopyFeedback>El navegador bloqueó la copia automática.</CopyFeedback>
      )}

      {local && (
        <LocalNotice>
          Estás ejecutando PaintNum localmente ({pageUrl}). Los enlaces de compartir
          solo son útiles para otros cuando la app esté publicada con URL pública.
        </LocalNotice>
      )}
      <Guidance>{INSTAGRAM_GUIDANCE}</Guidance>
    </ShareSection>
  )
}
