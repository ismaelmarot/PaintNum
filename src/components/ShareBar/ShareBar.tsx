import { useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { SHARE_INTENTS, buildIntentUrl, type ShareTargetId } from '@/config/sharing'
import { useSharing } from '@/components/ShareBar/useSharing'
import {
  FacebookGlyph,
  InstagramGlyph,
  PinterestGlyph,
  TelegramGlyph,
  WhatsAppGlyph,
  XGlyph,
} from '@/components/ShareBar/icons'
import { BRAND_COLORS, type BrandColorKey } from '@/components/ShareBar/ShareBar.styles'
import type { PaintByNumberResult } from '@/interfaces/pbn'
import {
  Bar,
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

const INTENT_GLYPHS: Partial<
  Record<ShareTargetId, ComponentType<SVGProps<SVGSVGElement>>>
> = {
  whatsapp: WhatsAppGlyph,
  telegram: TelegramGlyph,
  x: XGlyph,
  pinterest: PinterestGlyph,
  facebook: FacebookGlyph,
  instagram: InstagramGlyph,
}

/** Los 6 socios y su color de marca; Instagram = descargar lámina. */
export function ShareBar({ result }: ShareBarProps) {
  const sharing = useSharing()
  const [downloadHint, setDownloadHint] = useState(false)
  const pageUrl = window.location.href
  const local = isLocalUrl(pageUrl)

  const openIntent = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <ShareSection>
      <Bar aria-label="Compartir resultado" role="group">
        {SHARE_INTENTS.map((intent) => {
          const Glyph = INTENT_GLYPHS[intent.id]
          const brand = BRAND_COLORS[intent.id as BrandColorKey]
          if (!Glyph || !brand) return null

          if (intent.id === 'instagram') {
            return (
              <ShareButton
                key={intent.id}
                type="button"
                $brand={brand}
                aria-label={`${intent.label}: descargar lámina`}
                title={`${intent.label}: descargar lámina`}
                onClick={() => {
                  void sharing.downloadPainting(result)
                  setDownloadHint(true)
                }}
              >
                <Glyph />
              </ShareButton>
            )
          }

          const url = buildIntentUrl(intent, pageUrl)
          if (!url) return null
          return (
            <ShareButton
              key={intent.id}
              type="button"
              $brand={brand}
              aria-label={`Compartir en ${intent.label}`}
              title={`Compartir en ${intent.label}`}
              onClick={() => openIntent(url)}
            >
              <Glyph />
            </ShareButton>
          )
        })}
      </Bar>

      {downloadHint && (
        <LocalNotice>Lámina descargada: publicala desde Instagram.</LocalNotice>
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
