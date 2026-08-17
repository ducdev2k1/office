import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/_variables.scss';
import './styles/_keyframe-animations.scss';
import './styles.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
