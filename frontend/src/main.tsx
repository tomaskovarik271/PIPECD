import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import './index.css'
import App from './App.tsx'
import { useAppStore } from './stores/useAppStore'
import { themes } from './theme'

// Create a wrapper component to access the Zustand store
const AppWithTheme = () => {
  const currentThemeMode = useAppStore((state) => state.currentTheme)
  const activeTheme = themes[currentThemeMode] || themes.light

  return (
    <ChakraProvider theme={activeTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithTheme />
  </StrictMode>,
)
