import type { PaletteColor, RgbColor } from '@/interfaces'
import { hexFrom } from '@/interfaces/image'
import {
  Swatch,
  Table,
  Td,
  Th,
} from '@/components/ColorPaletteTable/ColorPaletteTable.styles'

function rgbString({ r, g, b }: RgbColor): string {
  return `${r}, ${g}, ${b}`
}

function rgbaString({ r, g, b }: RgbColor): string {
  return `rgba(${r}, ${g}, ${b}, 1)`
}

function coveragePct(coverage: number): string {
  return `${(coverage * 100).toFixed(1)} %`
}

export interface ColorPaletteTableProps {
  palette: PaletteColor[]
}

/** Tabla sincronizada con la paleta de la lámina generada. */
export function ColorPaletteTable({ palette }: ColorPaletteTableProps) {
  return (
    <Table data-testid="palette-table">
      <thead>
        <tr>
          <Th scope="col">Nº</Th>
          <Th scope="col">Muestra</Th>
          <Th scope="col">HEX</Th>
          <Th scope="col">RGB</Th>
          <Th scope="col">RGBA</Th>
          <Th scope="col">Superficie</Th>
        </tr>
      </thead>
      <tbody>
        {[...palette]
          .sort((a, b) => a.number - b.number)
          .map((color) => {
            const hex = hexFrom(color.color)
            return (
              <tr key={color.number}>
                <Td>{color.number}</Td>
                <Td>
                  <Swatch
                    $color={hex}
                    role="img"
                    aria-label={`Muestra del color ${color.number}`}
                  />
                </Td>
                <Td>{hex}</Td>
                <Td>{rgbString(color.color)}</Td>
                <Td>{rgbaString(color.color)}</Td>
                <Td>{coveragePct(color.coverage)}</Td>
              </tr>
            )
          })}
      </tbody>
    </Table>
  )
}
