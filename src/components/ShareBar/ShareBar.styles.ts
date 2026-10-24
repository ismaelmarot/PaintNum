import styled from 'styled-components'
import { focusRing } from '@/styles/BaseStyles'

export const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`

export const ShareButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: ${({ theme }) => theme.border.subtle};
  border-radius: ${({ theme }) => theme.radius.round};
  background-color: ${({ theme }) => theme.color.background};
  color: ${({ theme }) => theme.color.textSecondary};
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.ease.standard},
    color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.ease.standard};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.color.surfaceMuted};
    color: ${({ theme }) => theme.color.text};
  }

  &:focus-visible {
    ${focusRing}
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

export const ShareSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const LocalNotice = styled.p`
  font-size: ${({ theme }) => theme.typography.size.caption};
  color: ${({ theme }) => theme.color.textSecondary};
  margin: 0;
`

export const CopyFeedback = styled.span`
  font-size: ${({ theme }) => theme.typography.size.caption};
  color: ${({ theme }) => theme.color.textSecondary};
`

export const Guidance = styled.p`
  font-size: ${({ theme }) => theme.typography.size.caption};
  color: ${({ theme }) => theme.color.textSecondary};
  margin: 0;
`
