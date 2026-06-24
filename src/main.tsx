import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ContentProvider } from './context/ContentContext';
import { DeploymentsProvider } from './context/DeploymentsContext';
import { RotationScheduleProvider } from './context/RotationScheduleContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <ContentProvider>
          <RotationScheduleProvider>
            <DeploymentsProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </DeploymentsProvider>
          </RotationScheduleProvider>
        </ContentProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
