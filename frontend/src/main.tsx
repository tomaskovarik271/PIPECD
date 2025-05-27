import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react'
import { ApolloProvider } from '@apollo/client'
import './index.css'
import App from './App.tsx'
import { useThemeStore } from './stores/useThemeStore'
import { themes } from './theme'
import { apolloClient } from './lib/apolloClient'

// Create a wrapper component to access the Zustand store
const AppWithTheme: React.FC = () => {
  const currentThemeMode = useThemeStore((state) => state.currentTheme)
  const activeTheme = themes[currentThemeMode] || themes.light

  return (
    <ApolloProvider client={apolloClient}>
    <ChakraProvider theme={activeTheme}>
      <ColorModeScript initialColorMode={activeTheme.config.initialColorMode} />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
    </ApolloProvider>
  )
}

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
    <AppWithTheme />
    </React.StrictMode>
)
}
