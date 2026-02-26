import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#064E3B',
                color: '#ECFDF5',
                borderRadius: '12px',
                fontFamily: "'Karla', sans-serif",
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#ECFDF5' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#ECFDF5' },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
