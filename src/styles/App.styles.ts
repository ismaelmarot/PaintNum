import styled from 'styled-components'

/** Columna central: comparador y estados. */
export const Stage = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.m};
  min-width: 0;
`

export const WorkspaceGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: ${({ theme }) => theme.spacing.xl};
  align-items: start;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.xl}`};

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    padding: ${({ theme }) => `${theme.spacing.l} ${theme.spacing.m}`};
  }
`

export const Section = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xl};

  @media (max-width: 900px) {
    padding: 0 ${({ theme }) => theme.spacing.m} ${({ theme }) => theme.spacing.l};
  }
`

export const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.size.title3};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.m};
  color: ${({ theme }) => theme.color.text};
`

export const Hero = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.l}`};
`

export const HeroTitle = styled.p`
  font-size: ${({ theme }) => theme.typography.size.title1};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.display};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.l};
`

export const ProcessingNote = styled.output`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.size.footnote};
  color: ${({ theme }) => theme.color.textSecondary};
`

export const ErrorNote = styled.output`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.size.footnote};
  color: ${({ theme }) => theme.color.danger};
`

export const Dots = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: ${({ theme }) => theme.radius.round};
  border: 2px solid ${({ theme }) => theme.color.textTertiary};
  border-top-color: ${({ theme }) => theme.color.accent};
  animation: spin 900ms linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

export const AppleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.s} ${theme.spacing.m}`};
  border: ${({ theme }) => theme.border.subtle};
  border-radius: ${({ theme }) => theme.radius.round};
  background-color: ${({ theme }) => theme.color.background};
  color: ${({ theme }) => theme.color.text};
  font: ${({ theme }) => `500 ${theme.typography.size.footnote} ${theme.typography.family}`};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.color.surfaceMuted};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.color.accent};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

export const TableWrap = styled.div`
  overflow-x: auto;
`
