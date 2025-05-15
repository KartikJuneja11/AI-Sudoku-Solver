import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/theme-provider'
import { PythonProvider, usePython } from 'react-py';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system">
        <PythonProvider>

            <App />
        </PythonProvider>
    </ThemeProvider>
  </StrictMode>,
)
