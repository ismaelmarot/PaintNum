import styled from 'styled-components'

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.s};
  flex-wrap: wrap;
`

export const BusyNote = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.typography.size.footnote};
  color: ${({ theme }) => theme.color.textSecondary};

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .spinner {
    animation: spin 0.9s linear infinite;
  }
`

export const PrimaryButton = styled.button<{ $busy: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.s} ${theme.spacing.l}`};
  border: none;
  border-radius: ${({ theme }) => theme.radius.round};
  background-color: ${({ theme }) => theme.color.accent};
  color: #ffffff;
  font-size: ${({ theme }) => theme.typography.size.callout};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.ease.standard};

  svg {
    flex: none;
  }

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.color.accentHover};
  }

  ${({ $busy }) =>
    $busy
      ? 'opacity: 0.7; cursor: default;'
      : ''}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

export const SecondaryButton = styled(PrimaryButton)`
  background-color: ${({ theme }) => theme.color.background};
  color: ${({ theme }) => theme.color.text};
  border: ${({ theme }) => theme.border.subtle};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.color.surfaceMuted};
  }
`

export const ExportError = styled.span`
  font-size: ${({ theme }) => theme.typography.size.footnote};
  color: ${({ theme }) => theme.color.danger};
`
