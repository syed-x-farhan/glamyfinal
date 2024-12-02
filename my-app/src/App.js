import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/sign-in_sign-up_context';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Save from './pages/Save';
import Search from './pages/Search';
import Checkout from './pages/Checkout'; 
import CompleteOrder from './pages/CompleteOrder'; 
import ProductPage from './pages/productpage';
import AppProviders from './context/App_providers';
import Header from './components/Header'; 
import './App.css'; 
import { CheckoutProvider } from './context/checkout_context';
import { ProfileProvider } from './context/profile_context';

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <AppProviders>
      <CheckoutProvider>
        <ProfileProvider>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile/*" element={<Profile />} />
              <Route path="/save" element={<Save />} />
              <Route path="/search" element={<Search />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/complete_order" element={<CompleteOrder />} />
              <Route path="/product/:productId" element={<ProductPage />} />
              <Route path="/" element={<Navigate to="/home" />} />
            </Routes>
            <BottomNav />
          </div>
        </ProfileProvider>
      </CheckoutProvider>
    </AppProviders>
  );
}

export default App;
