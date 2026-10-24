import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import { App } from '@/App'
import { BaseStyles } from '@/styles/BaseStyles'
import { theme } from '@/styles/theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <BaseStyles />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
