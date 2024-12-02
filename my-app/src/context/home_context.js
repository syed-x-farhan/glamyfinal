import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios'; // Import axios instance
import { useAuth } from './sign-in_sign-up_context'; // Import useAuth to access user information
import { useCart } from './cart_context'; // Add this import

const HomeContext = createContext();

export const useHome = () => {
  return useContext(HomeContext);
};

export const HomeProvider = ({ children }) => {
  const { user } = useAuth(); // Access user information
  const { addToCart } = useCart(); // Add this line
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('/api/products/featured');
        setItems(response.data.map(item => ({
          ...item,
          product_id: item.product_id || item.id,
          price: parseFloat(item.price)
        })));
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setError(`Failed to load featured products: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleSwipe = async (item) => {
    console.log("handleSwipe called with item:", item);
    const storedUser = localStorage.getItem('user');
    console.log("Raw stored user:", storedUser);
    
    if (user) {
      console.log("Context user:", user);
      try {
        console.log("User found, attempting to add to cart");
        await addToCart(item);
        console.log("Item swiped and added to cart:", item);
      } catch (error) {
        console.error("Failed to add item to cart:", error);
      }
    } else {
      console.error("User not logged in or user data missing");
      console.log("localStorage content:", {
        user: localStorage.getItem('user'),
        token: localStorage.getItem('token')
      });
    }
  };

  return (
    <HomeContext.Provider value={{ items, setItems, loading, error, handleSwipe }}>
      {children}
    </HomeContext.Provider>
  );
};
