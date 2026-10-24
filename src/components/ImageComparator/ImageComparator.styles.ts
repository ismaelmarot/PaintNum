import styled from 'styled-components'

export const PaintedLayer = styled.div`
  position: absolute;
  inset: 0;

  & > canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
`

export const Spacer = styled.div`
  width: 100%;
`

export interface ContainerProps {
  readonly $aspectRatio: string
}

export const Container = styled.div<ContainerProps>`
  position: relative;
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.large};
  overflow: hidden;
  border: ${({ theme }) => theme.border.subtle};
  background-color: ${({ theme }) => theme.color.surface};
  /* Tacto: arrastrar el divisor no debe desplazar la página. */
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio};
`

export const Layer = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
`

export const DividerLine = styled.div<{ $positionPct: number }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${({ $positionPct }) => `${$positionPct}%`};
  width: 2px;
  transform: translateX(-1px);
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
  pointer-events: none;
`

export const DividerHandle = styled.button`
  position: absolute;
  top: 50%;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.round};
  border: none;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: ${({ theme }) => theme.shadow.card};
  transform: translate(-50%, -50%);
  cursor: ew-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.text};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.accent};
    outline-offset: 2px;
  }
`

export const Tag = styled.span<{ $align: 'left' | 'right' }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.s};
  ${({ $align }) => ($align === 'left' ? 'left' : 'right')}: ${({ theme }) => theme.spacing.s};
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.xs}`};
  border-radius: ${({ theme }) => theme.radius.round};
  background-color: rgba(29, 29, 31, 0.7);
  color: rgba(255, 255, 255, 0.95);
  font-size: ${({ theme }) => theme.typography.size.caption};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  pointer-events: none;
`
