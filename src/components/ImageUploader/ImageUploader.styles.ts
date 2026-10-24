import styled from 'styled-components'

export const DROP_ZONE_MIN_HEIGHT = '300px'

export const DropZone = styled.button<{
  $dragging: boolean
  $processing: boolean
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.s};
  width: 100%;
  min-height: ${DROP_ZONE_MIN_HEIGHT};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1.5px dashed
    ${({ theme, $dragging }) =>
      $dragging ? theme.color.accent : theme.color.borderStrong};
  border-radius: ${({ theme }) => theme.radius.large};
  background-color: ${({ theme, $dragging }) =>
    $dragging ? 'rgba(10, 132, 255, 0.05)' : theme.color.background};
  color: ${({ theme }) => theme.color.textSecondary};
  cursor: pointer;
  transition:
    border-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.ease.standard},
    background-color ${({ theme }) => theme.motion.base} ${({ theme }) => theme.ease.standard};

  ${({ $processing, theme }) =>
    $processing &&
    `
      opacity: 0.65;
      border-color: ${theme.color.borderStrong};
      cursor: default;
    `}

  /* Sin click durante procesamiento. */
  &:disabled {
    cursor: default;
  }
`

export const UploaderIcon = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.color.textTertiary};
`

export const UploaderTitle = styled.span`
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.size.title2};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  color: ${({ theme }) => theme.color.text};
`

export const UploaderHint = styled.span`
  font-size: ${({ theme }) => theme.typography.size.footnote};
  color: ${({ theme }) => theme.color.textSecondary};
`

export const UploaderError = styled.span`
  font-size: ${({ theme }) => theme.typography.size.footnote};
  color: ${({ theme }) => theme.color.danger};
`
