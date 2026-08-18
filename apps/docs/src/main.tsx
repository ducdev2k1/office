import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from '@office/i18n';
import { initTheme } from '@office/ui-kit';
import '@/styles/_variables.scss';
import '@/styles/_keyframe-animations.scss';
import '@/styles.css';
import App from '@/App';

initTheme();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
