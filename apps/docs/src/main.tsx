import App from '@/App';
import { I18nProvider } from '@office/i18n';
import { initTheme } from '@office/ui-kit';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Style
import '@/assets/styles/styles.css';

initTheme();

const Main = () => (
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Render app
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Main />);
