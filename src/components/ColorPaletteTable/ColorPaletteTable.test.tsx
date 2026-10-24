import { render, screen, within } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it } from 'vitest'
import { ColorPaletteTable } from '@/components/ColorPaletteTable'
import { theme } from '@/styles/theme'
import { generatePaintByNumbers } from '@/utils/imageProcessing/pipeline'
import { solidSplitImage } from '@/utils/imageProcessing/__fixtures__/images'
import { hexFrom } from '@/interfaces/image'

describe('ColorPaletteTable', () => {
  it('refleja la paleta actual con número, HEX, RGB y RGBA', () => {
    const result = generatePaintByNumbers(solidSplitImage(), {
      colorCount: 8,
      smallRegionRatio: 0.002,
      smallRegionMinPx: 0,
      maxMergePasses: 2,
    })

    render(
      <ThemeProvider theme={theme}>
        <ColorPaletteTable palette={result.palette} />
      </ThemeProvider>,
    )

    const table = screen.getByTestId('palette-table')
    const rows = within(table).getAllByRole('row')
    // header + una fila por color de la paleta
    expect(rows).toHaveLength(result.palette.length + 1)

    for (const color of result.palette) {
      const row = screen.getByText(String(color.number)).closest('tr')!
      expect(within(row).getByText(hexFrom(color.color))).toBeInTheDocument()
      expect(
        within(row).getByText(
          `${color.color.r}, ${color.color.g}, ${color.color.b}`,
        ),
      ).toBeInTheDocument()
      expect(
        within(row).getByText(
          `rgba(${color.color.r}, ${color.color.g}, ${color.color.b}, 1)`,
        ),
      ).toBeInTheDocument()
    }
  })

  it('los porcentajes de superficie se muestran con un decimal', () => {
    render(
      <ThemeProvider theme={theme}>
        <ColorPaletteTable
          palette={[
            {
              number: 1,
              index: 0,
              color: { r: 220, g: 30, b: 30 },
              pixelCount: 5,
              coverage: 0.5,
            },
            {
              number: 2,
              index: 1,
              color: { r: 30, g: 40, b: 220 },
              pixelCount: 5,
              coverage: 0.5,
            },
          ]}
        />
      </ThemeProvider>,
    )
    expect(screen.getAllByText('50.0 %')).toHaveLength(2)
  })
})
