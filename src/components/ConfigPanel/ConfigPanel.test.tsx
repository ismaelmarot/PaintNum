import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'
import { ConfigPanel } from '@/components/ConfigPanel'
import { theme } from '@/styles/theme'
import { PROCESSING_LIMITS } from '@/config/processing'
import type { WorkspaceConfig } from '@/interfaces/workspace'

const DEFAULT_CONFIG: WorkspaceConfig = {
  colorCount: PROCESSING_LIMITS.defaultColorCount,
  detail: 'balanced',
  showNumbers: true,
  showContours: true,
  paper: {
    paperSize: 'A4',
    orientation: 'portrait',
    marginsMm: 10,
  },
}

function setup(overrides: Partial<WorkspaceConfig> = {}) {
  const onConfigChange = vi.fn()
  render(
    <ThemeProvider theme={theme}>
      <ConfigPanel
        config={{ ...DEFAULT_CONFIG, ...overrides }}
        onConfigChange={onConfigChange}
      />
    </ThemeProvider>,
  )
  return onConfigChange
}

describe('ConfigPanel', () => {
  it('slider de colores muestra límites y valor actual', async () => {
    setup()
    const slider = screen.getByRole('slider', { name: 'Cantidad de colores' })
    expect(slider).toHaveAttribute('min', String(PROCESSING_LIMITS.minColors))
    expect(slider).toHaveAttribute('max', String(PROCESSING_LIMITS.maxColors))
    expect(slider).toHaveValue(String(PROCESSING_LIMITS.defaultColorCount))
    expect(screen.getByText(String(PROCESSING_LIMITS.defaultColorCount))).toBeInTheDocument()
  })

  it('notifica el cambio de cantidad de colores desde el slider', async () => {
    const onConfigChange = setup()
    fireEvent.change(
      screen.getByRole('slider', { name: 'Cantidad de colores' }),
      { target: { value: '12' } },
    )
    expect(onConfigChange).toHaveBeenCalledWith({ colorCount: 12 })
  })

  it('permite cambiar tamaño de papel y conserva el resto de la configuración', async () => {
    const onConfigChange = setup()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'A3' }))
    expect(onConfigChange).toHaveBeenCalledWith({
      paper: DEFAULT_CONFIG.paper.paperSize
        ? { ...DEFAULT_CONFIG.paper, paperSize: 'A3' }
        : DEFAULT_CONFIG.paper,
    })
  })

  it('permite cambiar orientación y márgenes', async () => {
    const onConfigChange = setup()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Horizontal' }))
    expect(onConfigChange).toHaveBeenLastCalledWith({
      paper: { ...DEFAULT_CONFIG.paper, orientation: 'landscape' },
    })

    fireEvent.change(screen.getByRole('slider', { name: 'Márgenes' }), {
      target: { value: '18' },
    })
    expect(onConfigChange).toHaveBeenLastCalledWith({
      paper: { ...DEFAULT_CONFIG.paper, marginsMm: 18 },
    })
  })

  it('permite cambiar el nivel de detalle', async () => {
    const onConfigChange = setup()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Grueso' }))
    expect(onConfigChange).toHaveBeenCalledWith({ detail: 'coarse' })
  })

  it('deshabilita los controles cuando se procesa', () => {
    render(
      <ThemeProvider theme={theme}>
        <ConfigPanel config={DEFAULT_CONFIG} onConfigChange={vi.fn()} disabled />
      </ThemeProvider>,
    )
    expect(screen.getByRole('slider', { name: 'Cantidad de colores' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'A4' })).toBeDisabled()
  })

  it('ofrece los tamaños A5, A2, Oficio y Doble carta además de A4/A3/Carta', () => {
    setup()
    for (const name of ['A5', 'A2', 'Oficio', 'Doble carta', 'A4', 'A3', 'Carta']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('papel personalizado: campos de ancho y alto en mm con validación', async () => {
    const onConfigChange = setup()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Personalizado' }))
    // Primer click define el tamaño inicial.
    expect(onConfigChange).toHaveBeenCalledWith({
      paper: { ...DEFAULT_CONFIG.paper, paperSize: 'Custom', customSize: { width: 200, height: 300 } },
    })

    const onConfigChange2 = setup({
      paper: { ...DEFAULT_CONFIG.paper, paperSize: 'Custom', customSize: { width: 200, height: 300 } },
    })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Ancho personalizado en milímetros' }), {
      target: { value: '320' },
    })
    expect(onConfigChange2).toHaveBeenCalledWith({
      paper: {
        ...DEFAULT_CONFIG.paper,
        paperSize: 'Custom',
        customSize: { width: 320, height: 300 },
      },
    })
  })

  it('papel personalizado fuera de rango: muestra advertencia y sin medidas resueltas', () => {
    setup({
      paper: {
        ...DEFAULT_CONFIG.paper,
        paperSize: 'Custom',
        customSize: { width: 20, height: 300 },
      },
    })
    expect(screen.getByRole('alert')).toHaveTextContent(/entre 50 y 1000 mm/)
    expect(screen.getByText('Definí ancho × alto en mm')).toBeInTheDocument()
  })
})
