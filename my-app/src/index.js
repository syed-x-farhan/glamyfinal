import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import SignupLogin from './pages/SignupLogin';
import AppProviders from './context/App_providers';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <Routes>
          <Route path="/login" element={<SignupLogin />} />
          <Route path="/*" element={<App />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();