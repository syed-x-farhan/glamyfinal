import React, { createContext, useState, useContext } from 'react';
import axios from '../utils/axios';
import { useCart } from './cart_context';

const CheckoutContext = createContext();

export const CheckoutProvider = ({ children }) => {
  const { cartItems, clearCart } = useCart();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    payment: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const submitOrder = async (totals, navigate) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Raw cart items:', cartItems);
      
      const processedProducts = cartItems.map(item => ({
        productId: parseInt(item.product_id || item.id),
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price)
      }));

      const invalidProducts = processedProducts.filter(item => !item.productId || item.productId > 20);
      if (invalidProducts.length > 0) {
        console.error('Invalid product IDs found:', invalidProducts);
        throw new Error('Invalid product IDs in cart');
      }

      const orderData = {
        userId: user.userId,
        totalPrice: parseFloat(totals.total),
        shippingAddress: `${formData.address} ${formData.apartment || ''}`.trim(),
        city: formData.city,
        country: formData.country || 'Pakistan',
        postalCode: formData.postalCode,
        phoneNumber: formData.phone,
        paymentMethod: formData.payment,
        shippingFirstName: formData.firstName,
        shippingLastName: formData.lastName,
        shippingEmail: formData.email,
        products: processedProducts
      };

      console.log('Processed order data:', orderData);

      const response = await axios.post('/api/orders', orderData);
      
      // Clear the cart after successful order
      await clearCart();
      
      // Navigate to success page
      navigate('/complete_order', { 
        state: { 
          orderId: response.data.orderId,
          message: 'Order placed successfully!' 
        }
      });
      
    } catch (err) {
      console.error('Error submitting order:', err.response?.data || err);
      setError(err.response?.data?.error || 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckoutContext.Provider
      value={{
        formData,
        loading,
        error,
        handleChange,
        submitOrder,
        setFormData,
        setError
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => useContext(CheckoutContext);