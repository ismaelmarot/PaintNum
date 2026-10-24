import { getAllSocialLinks } from '@/config/social'
import { FacebookIcon, GitHubIcon, InstagramIcon, LinkedInIcon } from '@/components/Footer/icons'
import {
  FooterContent,
  Handle,
  SocialIcon,
  SocialLink,
  SocialList,
  SocialPending,
  StyledFooter,
} from '@/components/Footer/Footer.styles'

const SOCIAL_ICONS = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
} as const

/**
 * Footer del desarrollador (§15): los cuatro iconos siempre visibles.
 * Sin URL → no interactivo con indicación accesible de pendiente.
 */
export function Footer() {
  const links = getAllSocialLinks()
  const year = new Date().getFullYear()

  return (
    <StyledFooter>
      <FooterContent>
        <Handle>© {year} Ismael Marot</Handle>
        <SocialList aria-label="Redes sociales del desarrollador">
          {links.map((link) => {
            const Icon = SOCIAL_ICONS[link.id]
            if (link.pending) {
              return (
                <SocialPending
                  key={link.id}
                  title={`${link.name} (perfil pendiente de configurar)`}
                  aria-label={`Perfil de ${link.name} pendiente de configurar`}
                >
                  <SocialIcon aria-hidden="true">
                    <Icon width="20" height="20" />
                  </SocialIcon>
                </SocialPending>
              )
            }
            return (
              <SocialLink
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Perfil de ${link.name} del desarrollador`}
              >
                <SocialIcon aria-hidden="true">
                  <Icon width="20" height="20" />
                </SocialIcon>
              </SocialLink>
            )
          })}
        </SocialList>
      </FooterContent>
    </StyledFooter>
  )
}
