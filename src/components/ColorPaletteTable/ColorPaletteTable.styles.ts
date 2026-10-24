import styled from 'styled-components'

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.typography.size.footnote};
`

export const Caption = styled.caption`
  text-align: left;
  caption-side: top;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  color: ${({ theme }) => theme.color.textSecondary};
`

export const Th = styled.th`
  text-align: left;
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  color: ${({ theme }) => theme.color.textSecondary};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.xs}`};
  border-bottom: ${({ theme }) => theme.border.subtle};
  white-space: nowrap;
`

export const Td = styled.td`
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.xs}`};
  border-bottom: 1px solid ${({ theme }) => theme.color.surfaceMuted};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text};
`

export const Swatch = styled.span<{ $color: string }>`
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: ${({ theme }) => theme.radius.small};
  background-color: ${({ $color }) => $color};
  border: 1px solid rgba(0, 0, 0, 0.08);
`
