import type { MouseEventHandler } from 'react'
import {
  PresentationContainer,
  PresentationContentStyled,
  PresentationIcon,
  PresentationTitle,
  PresentationSubtitle,
  PresentationButton,
  PresentationFooter,
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
          src={`${import.meta.env.BASE_URL}icons/icon-192.png`}
          alt="PaintNum"
          width={128}
          height={128}
        />
        <PresentationTitle>PaintNum</PresentationTitle>
        <PresentationSubtitle>Crea tu propia Pintura por números</PresentationSubtitle>
        <PresentationButton onClick={handleDismiss}>Comenzar</PresentationButton>
      </PresentationContentStyled>
      <PresentationFooter>
        <PresentationVersion>v1.0.0 Stable</PresentationVersion>
        <PresentationDeveloper>Developed by Ismael Marot</PresentationDeveloper>
      </PresentationFooter>
    </PresentationContainer>
  )
}

export { AppPresentation }
