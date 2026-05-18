import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Video02Page from './Video02Page.tsx';
import YogaFacialFunnel from './YogaFacialFunnel.tsx';
import './index.css';

// Simple path-based routing (no router dependency needed)
const path = window.location.pathname;
const isVideo02 = path === '/video02' || path === '/video02/';
const isYoga = path === '/yoga' || path === '/yoga/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isYoga ? <YogaFacialFunnel /> : isVideo02 ? <Video02Page /> : <App />}
  </StrictMode>,
);
