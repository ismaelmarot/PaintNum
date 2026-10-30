import type { MouseEventHandler } from 'react'
import {
  PresentationContainer,
  PresentationContentStyled,
  PresentationIcon,
  PresentationTitle,
  PresentationSubtitle,
} from '@/components/AppPresentation/AppPresentation.styles'
import { AppleButton } from '@/styles/App.styles'

interface AppPresentationProps {
  onDismiss?: () => void
}

const AppPresentation = ({ onDismiss }: AppPresentationProps) => {
  const handleDismiss: MouseEventHandler<HTMLButtonElement> = () => {
    onDismiss?.()
  }

  return (
    <PresentationContainer>
      <PresentationContentStyled>
        <PresentationIcon
          src="/icons/icon-192.png"
          alt="PaintNum"
          width={96}
          height={96}
        />
        <PresentationTitle>PaintNum</PresentationTitle>
        <PresentationSubtitle>Conviértete en tu propia pintura por números</PresentationSubtitle>
        <AppleButton onClick={handleDismiss}>Empezar</AppleButton>
      </PresentationContentStyled>
    </PresentationContainer>
  )
}

export { AppPresentation }
