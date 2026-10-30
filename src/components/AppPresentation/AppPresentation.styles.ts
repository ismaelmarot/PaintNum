import styled, { keyframes } from 'styled-components'

const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export const PresentationContainer = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.color.background};
  z-index: 1000;
  animation: ${fadeIn} 1200ms ${({ theme }) => theme.ease.standard} both;
`

export const PresentationContentStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.l};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`

export const PresentationIcon = styled.img`
  width: 96px;
  height: 96px;
  object-fit: contain;
  animation: ${fadeInScale} 1200ms ${({ theme }) => theme.ease.standard} both;
`

export const PresentationTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.size.largeTitle};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.display};
  color: ${({ theme }) => theme.color.text};
  margin: 0;
  animation: ${fadeIn} 1200ms ${({ theme }) => theme.ease.standard} both;
  animation-delay: 1200ms;
`

export const PresentationSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.size.callout};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  color: ${({ theme }) => theme.color.textSecondary};
  margin: 0;
  animation: ${fadeIn} 1200ms ${({ theme }) => theme.ease.standard} both;
  animation-delay: 2400ms;
`

export const PresentationButton = styled.button`
  margin-top: ${({ theme }) => theme.spacing.l};
  padding: ${({ theme }) => `${theme.spacing.s} ${theme.spacing.m}`};
  border: ${({ theme }) => theme.border.subtle};
  border-radius: ${({ theme }) => theme.radius.round};
  background-color: ${({ theme }) => theme.color.background};
  color: ${({ theme }) => theme.color.text};
  font-family: ${({ theme }) => theme.typography.family};
  font-size: ${({ theme }) => theme.typography.size.footnote};
  font-weight: 500;
  cursor: pointer;
  animation: ${fadeIn} 1200ms ${({ theme }) => theme.ease.standard} both;
  animation-delay: 3600ms;
`

export const PresentationVersion = styled.p`
  font-size: ${({ theme }) => theme.typography.size.footnote};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  color: ${({ theme }) => theme.color.textTertiary};
  margin: 0;
  animation: ${fadeIn} 1200ms ${({ theme }) => theme.ease.standard} both;
  animation-delay: 4800ms;
`

export const PresentationDeveloper = styled.p`
  font-size: ${({ theme }) => theme.typography.size.footnote};
  font-weight: ${({ theme }) => theme.typography.weight.regular};
  color: ${({ theme }) => theme.color.textTertiary};
  margin: 0;
  animation: ${fadeIn} 1200ms ${({ theme }) => theme.ease.standard} both;
  animation-delay: 6000ms;
`
