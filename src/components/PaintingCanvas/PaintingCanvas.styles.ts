import styled, { css } from 'styled-components'

/** Canvas responsivo: ancho disponible manteniendo el aspecto (height auto). */
export const Wrapper = styled.canvas<{ $stretch: boolean }>`
  display: block;
  width: 100%;

  ${({ $stretch }) =>
    $stretch &&
    css`
      height: 100%;
    `}
`
