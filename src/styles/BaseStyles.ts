import { createGlobalStyle, css } from 'styled-components'

export const focusRing = css`
  outline: 2px solid ${(props) => props.theme.color.accent};
  outline-offset: 2px;
  border-radius: ${(props) => props.theme.radius.small};
`

export const BaseStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  body {
    margin: 0;
    font-family: ${(p) => p.theme.typography.family};
    font-size: ${(p) => p.theme.typography.size.body};
    line-height: ${(p) => p.theme.typography.lineHeight.body};
    color: ${(p) => p.theme.color.text};
    background-color: ${(p) => p.theme.color.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  a {
    color: inherit;
  }

  button {
    font: inherit;
  }

  :focus-visible {
    ${focusRing}
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`
