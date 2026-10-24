/**
 * Developer social profiles, rendered in the application footer.
 *
 * These contacts belong exclusively to the developer's personal
 * profiles — not the PaintNum product itself.
 *
 * §15: the four icons are ALWAYS rendered. When a URL is pending,
 * the entry becomes a non-interactive element with an accessible
 * "pending" indication — never a broken link, and never an invented URL.
 *
 * Sources (2026-10-23, provistos por el desarrollador):
 * - GitHub:    github.com/ismaelmarot
 * - LinkedIn:  linkedin.com/in/ismael-marot/
 * - Instagram: instagram.com/ismaelmarot/
 * - Facebook:  temporal → landing de Facebook hasta tener el perfil oficial.
 */

export const SOCIAL_LINKS = {
  github: 'https://github.com/ismaelmarot',
  linkedin: 'https://linkedin.com/in/ismael-marot/',
  instagram: 'https://instagram.com/ismaelmarot/',
  facebook: 'https://www.facebook.com/', // TODO temporal: landing de Facebook hasta tener el perfil oficial.
} as const

export type SocialId = keyof typeof SOCIAL_LINKS

export type SocialLink = {
  id: SocialId
  name: string
  url: string
  /** true cuando la URL aún no fue definida (icono no interactivo). */
  pending: boolean
}

const NAMES: Record<SocialId, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
}

/** Los cuatro perfiles, incluidos los pendientes (§15). */
export function getAllSocialLinks(): SocialLink[] {
  return (Object.keys(SOCIAL_LINKS) as SocialId[]).map((id) => {
    const url = SOCIAL_LINKS[id]
    return { id, name: NAMES[id], url, pending: url.trim() === '' }
  })
}

/** Solo los perfiles con URL configurada (para contextos que lo requieran). */
export function getAvailableSocialLinks(): SocialLink[] {
  return getAllSocialLinks().filter((link) => !link.pending)
}
