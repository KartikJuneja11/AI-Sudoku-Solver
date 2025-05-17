import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/theme-provider'
import { PythonProvider, usePython } from 'react-py';
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    throw '(skipping full reload)';
  });
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system">
        <PythonProvider>

            <App />
        </PythonProvider>
    </ThemeProvider>
  </StrictMode>,
)
