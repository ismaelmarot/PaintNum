import type { MouseEventHandler } from 'react'
import {
  PresentationContainer,
  PresentationContentStyled,
  PresentationIcon,
  PresentationTitle,
  PresentationSubtitle,
  PresentationButton,
  PresentationVersion,
  PresentationDeveloper,
} from '@/components/AppPresentation/AppPresentation.styles'

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
        <PresentationSubtitle>Crea tu propia Pintura por números</PresentationSubtitle>
        <PresentationButton onClick={handleDismiss}>Comenzar</PresentationButton>
        <PresentationVersion>v0.1.0 Stable</PresentationVersion>
        <PresentationDeveloper>Developed by Ismael Marot</PresentationDeveloper>
      </PresentationContentStyled>
    </PresentationContainer>
  )
}

export { AppPresentation }
