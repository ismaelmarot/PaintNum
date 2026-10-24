import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ShareBar } from '@/components/ShareBar'
import { BRAND_COLORS } from '@/components/ShareBar/ShareBar.styles'
import { buildIntentUrl, shareMessage, canShareFiles, SHARE_INTENTS } from '@/config/sharing'
import { theme } from '@/styles/theme'
import type { PaintByNumberResult } from '@/interfaces/pbn'

const RESULT: PaintByNumberResult = {
  width: 8,
  height: 4,
  palette: [
    { number: 1, index: 0, color: { r: 10, g: 20, b: 30 }, pixelCount: 16, coverage: 0.5 },
  ],
  labels: new Uint8Array(32).fill(0),
  regionIds: new Int32Array(32).fill(0),
  regions: [],
  config: {
    colorCount: 4,
    smallRegionRatio: 0.002,
    smallRegionMinPx: 0,
    maxMergePasses: 2,
  },
}

const copyLink = vi.fn(async () => true)
const sharePaintingFiles = vi.fn(async () => true)
const downloadPainting = vi.fn(async () => undefined)

vi.mock('@/components/ShareBar/useSharing', () => ({
  useSharing: () => ({
    nativeShareAvailable: false,
    copyLink,
    sharePaintingFiles,
    downloadPainting,
  }),
}))

describe('config/sharing', () => {
  it('construye intents con encodeURIComponent y mensaje adecuado', () => {
    const whatsapp = SHARE_INTENTS.find((intent) => intent.id === 'whatsapp')
    expect(whatsapp).toBeDefined()
    const url = buildIntentUrl(whatsapp!, 'https://paintnum.app/hola')
    expect(url).toContain('https://wa.me/?text=')
    expect(url).toContain(encodeURIComponent('https://paintnum.app/hola'))

    const telegram = SHARE_INTENTS.find((intent) => intent.id === 'telegram')!
    const tgUrl = buildIntentUrl(telegram, 'https://paintnum.app/hola')
    expect(tgUrl).toContain('https://t.me/share/url?url=')
    expect(tgUrl).toContain('&text=')
  })

  it('el aviso de URL local se incluye en el mensaje cuando es localhost', () => {
    const message = shareMessage('http://localhost:5173/')
    expect(message).toContain('localmente')
    const publicMessage = shareMessage('https://paintnum.app')
    expect(publicMessage).not.toContain('localmente')
  })

  it('canShareFiles devuelve false si el navegador no soporta canShare', () => {
    expect(canShareFiles({} as Navigator)).toBe(false)
  })
})

describe('ShareBar', () => {
  beforeEach(() => {
    copyLink.mockClear()
    sharePaintingFiles.mockClear()
    downloadPainting.mockClear()
  })

  it('muestra SOLO los 6 socios con icono de marca y sin copy/native', () => {
    render(
      <ThemeProvider theme={theme}>
        <ShareBar result={RESULT} />
      </ThemeProvider>,
    )
    const buttons = screen
      .getByRole('group', { name: 'Compartir resultado' })
      .querySelectorAll('button')
    expect(buttons).toHaveLength(6)

    for (const label of ['WhatsApp', 'Telegram', 'X', 'Pinterest', 'Facebook']) {
      expect(screen.getByRole('button', { name: `Compartir en ${label}` })).toBeInTheDocument()
    }
    expect(
      screen.getByRole('button', { name: 'Instagram: descargar lámina' }),
    ).toBeInTheDocument()
    // Ya no existen copiar enlace ni compartir del dispositivo.
    expect(screen.queryByRole('button', { name: /copiar enlace/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /dispositivo/i })).not.toBeInTheDocument()
  })

  it('los botones usan los colores oficiales de cada app', () => {
    // La fuente de verdad vive en BRAND_COLORS y colorea el glifo ($brand).
    expect(BRAND_COLORS).toEqual({
      whatsapp: '#25D366',
      telegram: '#229ED9',
      x: '#000000',
      pinterest: '#E60023',
      facebook: '#1877F2',
      instagram: '#E4405F',
    })
  })

  it('cada icono de marca es un glifo SVG decorativo', () => {
    render(
      <ThemeProvider theme={theme}>
        <ShareBar result={RESULT} />
      </ThemeProvider>,
    )
    const group = screen.getByRole('group', { name: 'Compartir resultado' })
    for (const svg of group.querySelectorAll('button svg')) {
      expect(svg).toHaveAttribute('aria-hidden')
    }
  })

  it('Instagram descarga la lámina y lo confirma sin prometer publicación', async () => {
    render(
      <ThemeProvider theme={theme}>
        <ShareBar result={RESULT} />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Instagram: descargar lámina' }))
    await waitFor(() => expect(downloadPainting).toHaveBeenCalled())
    expect(screen.getByText(/Lámina descargada/i)).toBeInTheDocument()
    expect(screen.getByText(/no permite publicar desde la web/i)).toBeInTheDocument()
  })

  it('los intents abren ventanas con la URL del intent', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(
      <ThemeProvider theme={theme}>
        <ShareBar result={RESULT} />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Compartir en Telegram' }))
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://t.me/share/url'),
      '_blank',
      'noopener,noreferrer',
    )
    openSpy.mockRestore()
  })
})
