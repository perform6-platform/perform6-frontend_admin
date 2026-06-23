import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ContentProvider } from './context/ContentContext';
import { RotationScheduleProvider } from './context/RotationScheduleContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ContentProvider>
        <RotationScheduleProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RotationScheduleProvider>
      </ContentProvider>
    </ThemeProvider>
  </StrictMode>,
);
