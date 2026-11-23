import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tp-tokens.css';
import './styles/tp-components.css';
import './styles/tp-omada.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
