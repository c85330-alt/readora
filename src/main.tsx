import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {runDevSupabaseConnectionCheck} from './lib/supabaseConnectionTest';

if (import.meta.env.DEV) {
  runDevSupabaseConnectionCheck();
}

createRoot(document.getElementById('root')!).render(<App />);
