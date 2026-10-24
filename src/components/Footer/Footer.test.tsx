import { render, screen, within } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it } from 'vitest'
import { Footer } from '@/components/Footer'
import { SOCIAL_LINKS } from '@/config/social'
import { theme } from '@/styles/theme'

function renderFooter() {
  return render(
    <ThemeProvider theme={theme}>
      <Footer />
    </ThemeProvider>,
  )
}

describe('Footer', () => {
  it('muestra el copyright con el año actual y el nombre del desarrollador', () => {
    renderFooter()
    expect(
      screen.getByText(`© ${new Date().getFullYear()} Ismael Marot`),
    ).toBeInTheDocument()
  })

  it('renderiza SIEMPRE los cuatro iconos (§15) como enlaces', () => {
    renderFooter()
    const nav = screen.getByRole('navigation', {
      name: 'Redes sociales del desarrollador',
    })
    expect(within(nav).getAllByRole('link')).toHaveLength(4)
    for (const name of ['GitHub', 'LinkedIn', 'Instagram', 'Facebook']) {
      expect(
        within(nav).getByRole('link', {
          name: `Perfil de ${name} del desarrollador`,
        }),
      ).toBeInTheDocument()
    }
    expect(nav.querySelectorAll('svg')).toHaveLength(4)
  })

  it('usa las URLs oficiales provistas (en nueva pestaña y seguras)', () => {
    renderFooter()
    const nav = screen.getByRole('navigation', {
      name: 'Redes sociales del desarrollador',
    })

    for (const [name, url] of [
      ['GitHub', SOCIAL_LINKS.github],
      ['LinkedIn', SOCIAL_LINKS.linkedin],
      ['Instagram', SOCIAL_LINKS.instagram],
      ['Facebook', SOCIAL_LINKS.facebook],
    ] as const) {
      const link = within(nav).getByRole('link', {
        name: `Perfil de ${name} del desarrollador`,
      })
      expect(link).toHaveAttribute('href', url)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
    // Ningún <a> con href vacío (nunca enlaces rotos ni URLs inventadas).
    for (const anchor of document.querySelectorAll('a')) {
      expect(anchor.getAttribute('href')).not.toBe('')
    }
  })

  it('los iconos son decorativos y el nombre accesible vive en el enlace', () => {
    renderFooter()
    const nav = screen.getByRole('navigation', {
      name: 'Redes sociales del desarrollador',
    })
    for (const svg of nav.querySelectorAll('svg')) {
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    }
  })
})
