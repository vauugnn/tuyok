import React from 'react';
import ReactDOM from 'react-dom/client';
import MapPage from './pages/map_page';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <MapPage />
  </React.StrictMode>
);
