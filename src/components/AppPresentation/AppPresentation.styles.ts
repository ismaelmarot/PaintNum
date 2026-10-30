import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
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
`

export const PresentationContentStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.l};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  animation: ${fadeIn} 600ms ${({ theme }) => theme.ease.standard} both;
`

export const PresentationIcon = styled.img`
  width: 96px;
  height: 96px;
  object-fit: contain;
`

export const PresentationTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.size.largeTitle};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.display};
  color: ${({ theme }) => theme.color.text};
  margin: 0;
`

export const PresentationSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.size.callout};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  color: ${({ theme }) => theme.color.textSecondary};
  margin: 0;
`
