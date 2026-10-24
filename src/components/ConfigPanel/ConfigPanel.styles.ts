import styled from 'styled-components'
import { focusRing } from '@/styles/BaseStyles'

export const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.l};
  padding: ${({ theme }) => `${theme.spacing.l} ${theme.spacing.m}`};
  border: ${({ theme }) => theme.border.subtle};
  border-radius: ${({ theme }) => theme.radius.large};
  background-color: ${({ theme }) => theme.color.background};
`

export const PanelGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

export const LabelRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.s};
`

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.size.footnote};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  color: ${({ theme }) => theme.color.textSecondary};
`

export const ThresholdRange = styled.span`
  font-size: ${({ theme }) => theme.typography.size.caption};
  color: ${({ theme }) => theme.color.textTertiary};
`

export const ValueBadge = styled.span`
  font-size: ${({ theme }) => theme.typography.size.footnote};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  color: ${({ theme }) => theme.color.text};
`

export const Slider = styled.input`
  width: 100%;
  appearance: none;
  height: 24px;
  background: transparent;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: ${({ theme }) => theme.radius.round};
    background-color: ${({ theme }) => theme.color.surfaceMuted};
  }
  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    margin-top: -7px;
    border-radius: ${({ theme }) => theme.radius.round};
    background-color: ${({ theme }) => theme.color.background};
    border: 1px solid ${({ theme }) => theme.color.borderStrong};
    box-shadow: ${({ theme }) => theme.shadow.subtle};
  }
  &::-moz-range-track {
    height: 4px;
    border-radius: ${({ theme }) => theme.radius.round};
    background-color: ${({ theme }) => theme.color.surfaceMuted};
  }
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: ${({ theme }) => theme.radius.round};
    background-color: ${({ theme }) => theme.color.background};
    border: 1px solid ${({ theme }) => theme.color.borderStrong};
    box-shadow: ${({ theme }) => theme.shadow.subtle};
  }
`

export const SegmentedControl = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`

export const SegmentedButton = styled.button<{ $selected: boolean }>`
  flex: 1 1 auto;
  min-width: 64px;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.s}`};
  border: ${({ theme, $selected }) =>
    $selected ? `1px solid ${theme.color.text}` : theme.border.subtle};
  border-radius: ${({ theme }) => theme.radius.round};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.color.text : theme.color.background};
  color: ${({ theme, $selected }) =>
    $selected ? theme.color.background : theme.color.text};
  font-size: ${({ theme }) => theme.typography.size.footnote};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.ease.standard},
    border-color ${({ theme }) => theme.motion.fast} ${({ theme }) => theme.ease.standard};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.color.borderStrong};
  }
`

export const SizeFields = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  font-size: ${({ theme }) => theme.typography.size.footnote};
  color: ${({ theme }) => theme.color.textSecondary};
  flex-wrap: wrap;
`

export const SizeInput = styled.input`
  width: 72px;
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.xs}`};
  border: ${({ theme }) => theme.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  background-color: ${({ theme }) => theme.color.background};
  color: ${({ theme }) => theme.color.text};
  font-size: ${({ theme }) => theme.typography.size.footnote};

  &:focus-visible {
    ${focusRing}
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 1;
  }
`

export const SizeWarning = styled.span`
  flex-basis: 100%;
  font-size: ${({ theme }) => theme.typography.size.caption};
  color: ${({ theme }) => theme.color.danger};
`
