import type { MouseEventHandler } from 'react'
import { Bar, Brand, BrandHint, GhostButton, BarActions } from '@/components/TopBar/TopBar.styles'

export interface TopBarProps {
  hasImage: boolean
  replaceButtonProps?: {
    label: string
    onClick: MouseEventHandler<HTMLButtonElement>
  }
}

/** Barra superior con la identidad de la app y acciones globales. */
export function TopBar({ hasImage, replaceButtonProps }: TopBarProps) {
  return (
    <Bar>
      <Brand>
        PaintNum
        <BrandHint>Pintura por números</BrandHint>
      </Brand>
      <BarActions>
        {hasImage && replaceButtonProps && (
          <GhostButton type="button" onClick={replaceButtonProps.onClick}>
            {replaceButtonProps.label}
          </GhostButton>
        )}
      </BarActions>
    </Bar>
  )
}
