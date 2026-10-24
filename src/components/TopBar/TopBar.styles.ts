import styled from 'styled-components'

export const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.l};
  padding: ${({ theme }) => `${theme.spacing.s} ${theme.spacing.xl}`};
  border-bottom: ${({ theme }) => theme.border.subtle};
`

export const Brand = styled.h1`
  font-size: ${({ theme }) => theme.typography.size.title2};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.display};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
`

export const BrandHint = styled.span`
  display: block;
  margin-top: 2px;
  font-size: ${({ theme }) => theme.typography.size.caption};
  font-weight: ${({ theme }) => theme.typography.weight.regular};
  color: ${({ theme }) => theme.color.textSecondary};
`

export const BarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.s};
`

export const GhostButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.m}`};
  border-radius: ${({ theme }) => theme.radius.round};
  border: ${({ theme }) => theme.border.subtle};
  background-color: transparent;
  color: ${({ theme }) => theme.color.text};
  font-size: ${({ theme }) => theme.typography.size.footnote};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.ease.standard};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.color.surfaceMuted};
  }
`
