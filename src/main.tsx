import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "SUPABASE KEY:",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
); 
