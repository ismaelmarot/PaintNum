import styled from 'styled-components'
import { focusRing } from '@/styles/BaseStyles'

export const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`

/** Colores oficiales de cada app (2026). */
export const BRAND_COLORS = {
  whatsapp: '#25D366',
  telegram: '#229ED9',
  x: '#000000',
  pinterest: '#E60023',
  facebook: '#1877F2',
  instagram: '#E4405F',
} as const

export type BrandColorKey = keyof typeof BRAND_COLORS

export const ShareButton = styled.button<{ $brand: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: ${({ theme }) => theme.radius.round};
  background-color: transparent;
  color: ${({ $brand }) => $brand};
  cursor: pointer;
  transition:
    transform ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.ease.standard},
    opacity ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.ease.standard};

  svg {
    width: 22px;
    height: 22px;
  }

  &:hover:not(:disabled) {
    transform: scale(1.08);
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
