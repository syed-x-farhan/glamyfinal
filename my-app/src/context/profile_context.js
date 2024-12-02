import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ProfileContext = React.createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user details
  const getUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (userId, userData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('Sending update request with data:', {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email
      });

      const response = await axios.put(
        `${API_URL}/api/users/${userId}`,
        {
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local storage and state only if the server update was successful
      if (response.data.user) {
        const updatedUser = {
          ...JSON.parse(localStorage.getItem('user')),
          firstName: response.data.user.first_name,
          lastName: response.data.user.last_name,
          email: response.data.user.email,
          userId
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      return response.data;
    } catch (err) {
      console.error('Error in updateUserProfile:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add this function to the ProfileProvider:
  const updateLocalUser = (userData) => {
    const updatedUser = {
      ...JSON.parse(localStorage.getItem('user')),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <ProfileContext.Provider value={{
      user,
      loading,
      error,
      getUserDetails,
      updateUserProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
    