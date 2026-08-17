import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { runSystemSelfHeal } from './lib/selfHeal';
import { SelfHealingErrorBoundary } from './components/SelfHealingErrorBoundary';

// Run autonomous self-healing sweep on boot
try {
  runSystemSelfHeal();
} catch (e) {
  console.error('Boot self-heal error:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SelfHealingErrorBoundary>
      <App />
    </SelfHealingErrorBoundary>
  </StrictMode>,
);
