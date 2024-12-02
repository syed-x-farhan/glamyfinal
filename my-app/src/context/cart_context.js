import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log("Fetching cart items for user:", user);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const userId = user.userId;
      console.log("Using userId for fetch:", userId);

      const response = await axios.get(`/api/cart/${userId}`);
      console.log("Fetched cart items:", response.data);

      setCartItems(response.data);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const addToCart = (product) => {
    console.log('Adding product to cart:', product);
    
    const productToAdd = {
        ...product,
        id: product.product_id || product.id,
        quantity: 1
    };

    console.log('Processed product for cart:', productToAdd);

    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === productToAdd.id);
        if (existingItem) {
            return prevItems.map(item =>
                item.id === productToAdd.id
                    ? { ...item, quantity: (item.quantity || 1) + 1 }
                    : item
            );
        }
        return [...prevItems, productToAdd];
    });
  };

  const updateCartItem = async (itemId, newQuantity) => {
    try {
      await axios.put(`/api/cart/${itemId}`, { quantity: newQuantity });
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/api/cart/${itemId}`);
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err.message);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart/user/:userId');
      setCartItems([]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      updateCartItem, 
      removeFromCart, 
      clearCart, 
      loading, 
      error 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);