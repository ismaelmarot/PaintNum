import styled, { css } from 'styled-components'
import { focusRing } from '@/styles/BaseStyles'

const IconButtonTapSize = '44px'

const IconButtonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${IconButtonTapSize};
  height: ${IconButtonTapSize};
  border-radius: ${({ theme }) => theme.radius.medium};
  color: ${({ theme }) => theme.color.textSecondary};

  /* §15: sin efectos hover de ningún tipo en los iconos del footer. */

  &:focus-visible {
    ${focusRing}
  }
`

export const StyledFooter = styled.footer`
  border-top: ${({ theme }) => theme.border.subtle};
  padding: ${({ theme }) => `${theme.spacing.l} ${theme.spacing.xl}`};

  @media (max-width: 600px) {
    padding: ${({ theme }) => `${theme.spacing.l} ${theme.spacing.m}`};
  }
`

export const FooterContent = styled.div`
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.m};
`

export const Handle = styled.span`
  font-size: ${({ theme }) => theme.typography.size.callout};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.caption};
  color: ${({ theme }) => theme.color.textSecondary};
`

export const SocialList = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
`

export const SocialLink = styled.a`
  ${IconButtonBase}

  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
  }
`

/** Estado pendiente: visible, no interactivo y sin apariencia de enlace. */
export const SocialPending = styled.span`
  ${IconButtonBase}

  color: ${({ theme }) => theme.color.textTertiary};
  cursor: default;

  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
  }
`

export const SocialIcon = styled.span`
  display: inline-flex;
  box-sizing: content-box;
`
