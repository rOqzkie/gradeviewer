import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Supabase project: https://jtpaqovsnbzpjccrnmbe.supabase.co
// Credentials are managed in kv_store.tsx (KV store) and services/supabaseClient.ts (app client).

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);