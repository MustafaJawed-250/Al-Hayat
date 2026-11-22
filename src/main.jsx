import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.jsx'
import { CartProvider } from './hooks/useCart.jsx'
import './index.css'

const theme = createTheme({
  palette: {
    primary: { main: '#0B3D2E' },
    secondary: { main: '#D4A017' },
    background: { default: '#F9F5ED', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif' },
    h2: { fontFamily: '"Playfair Display", Georgia, serif' },
    h3: { fontFamily: '"Playfair Display", Georgia, serif' },
    h4: { fontFamily: '"Playfair Display", Georgia, serif' },
  },
  shape: { borderRadius: 12 },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
