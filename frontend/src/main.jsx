import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './styles/global.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext';
import { GuestIdProvider } from './context/GuestIdContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { CompareProvider } from './context/CompareContext';
import { SettingsProvider } from './context/SettingsContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <GuestIdProvider>
            <SocketProvider>
              <CartProvider>
                <CompareProvider>
                  <AdminAuthProvider>
                    <App />
                  </AdminAuthProvider>
                </CompareProvider>
              </CartProvider>
            </SocketProvider>
          </GuestIdProvider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
