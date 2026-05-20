import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Video02Page from './Video02Page.tsx';
import YogaFacialFunnel from './YogaFacialFunnel.tsx';
import GotoxPage from './GotoxPage.tsx';
import './index.css';

// Simple path-based routing (no router dependency needed)
const path = window.location.pathname;
const isVideo02 = path === '/video02' || path === '/video02/';
const isYoga = path === '/yoga' || path === '/yoga/';
const isGotox = path === '/gotox' || path === '/gotox/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isGotox ? <GotoxPage /> : isYoga ? <YogaFacialFunnel /> : isVideo02 ? <Video02Page /> : <App />}
  </StrictMode>,
);
