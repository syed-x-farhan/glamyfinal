import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from '../utils/axios';
import { useAuth } from './sign-in_sign-up_context';

const SaveContext = createContext();

export const SaveProvider = ({ children }) => {
  const [savedItems, setSavedItems] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    console.log('Current user in SaveProvider:', user);
    console.log('User ID:', user?.user_id);
    console.log('Full user object:', JSON.stringify(user, null, 2));
  }, [user]);

  useEffect(() => {
    const fetchSavedItems = async () => {
      if (user?.userId) {
        try {
          const response = await axios.get(`/api/products/saved/${user.userId}`);
          setSavedItems(response.data);
        } catch (error) {
          console.error('Error fetching saved items:', error);
        }
      }
    };

    fetchSavedItems();
  }, [user]);

  const toggleSaveItem = useCallback(async (item) => {
    console.log('ToggleSaveItem called with:', item);
    console.log('Current user state:', user);
    console.log('User ID when saving:', user?.user_id);

    if (!user?.userId) {
      console.error('User must be logged in to save items');
      console.log('localStorage user:', localStorage.getItem('user'));
      console.log('Parsed localStorage user:', JSON.parse(localStorage.getItem('user')));
      return;
    }

    try {
      await axios.post('/api/products/save', {
        userId: user.userId,
        productId: item.id
      });

      setSavedItems((prevItems) => {
        const isAlreadySaved = prevItems.some((savedItem) => savedItem.id === item.id);
        return isAlreadySaved
          ? prevItems.filter((savedItem) => savedItem.id !== item.id)
          : [...prevItems, item];
      });
    } catch (error) {
      console.error('Error toggling save item:', error);
    }
  }, [user]);

  return (
    <SaveContext.Provider value={{ savedItems, toggleSaveItem }}>
      {children}
    </SaveContext.Provider>
  );
};

export const useSave = () => {
  const context = useContext(SaveContext);
  if (!context) {
    throw new Error('useSave must be used within a SaveProvider');
  }
  return context;
};

export default SaveProvider;