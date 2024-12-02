import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './checkout.module.css';
import { useCart } from '../context/cart_context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { useCheckout } from '../context/checkout_context';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { 
    formData, 
    loading, 
    error: contextError, 
    handleChange, 
    submitOrder,
    setError 
  } = useCheckout();
  
  const [selectedPayment, setSelectedPayment] = useState(null);

  const selectPayment = (paymentType) => {
    setSelectedPayment(selectedPayment === paymentType ? null : paymentType);
    handleChange({
      target: {
        name: 'payment',
        value: paymentType
      }
    });
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const tax = subtotal * 0.15; // 15% tax
    const delivery = subtotal > 1000 ? 0 : 100; // Free delivery over 1000
    const discount = subtotal > 2000 ? 200 : 0; // 200 discount over 2000
    const total = subtotal + tax + delivery - discount;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      delivery: delivery.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.payment) {
      setError('Please select a payment method');
      return;
    }

    if (formData.payment === 'card') {
      if (!formData.cardName || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        setError('Please fill in all card details');
        return;
      }
    }

    const totals = calculateTotals();
    await submitOrder(totals, navigate);
  };

  // Calculate totals before rendering
  const totals = calculateTotals();

  return (
    <div className={styles.checkoutContainer}>
      <h1>Checkout</h1>
      {loading && <div className={styles.loading}>Processing your order...</div>}
      {contextError && <div className={styles.error}>{contextError}</div>}
      
      <div className={styles.checkoutContent}>
        
        {/* Left Section (Shipping Form) */}
        <div className={styles.shippingForm}>
          <h2>Shipping Information</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Email address <span>*</span></label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>First name <span>*</span></label>
                <input 
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Last name <span>*</span></label>
                <input 
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Address <span>*</span></label>
                <input 
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Apartment (optional)</label>
                <input 
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  placeholder="Apartment, suite, etc."
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>City <span>*</span></label>
                <input 
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Postal code <span>*</span></label>
                <input 
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Enter postal code"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Phone number <span>*</span></label>
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            {/* Payment Section */}
            <div className={styles.paymentSection}>
              <h2>Choose Payment Method</h2>
              
              <div 
                className={`${styles.paymentOption} ${selectedPayment === 'card' ? styles.selected : ''}`}
                onClick={() => selectPayment('card')}
              >
                <div className={styles.paymentHeader}>
                  <div className={styles.paymentLeft}>
                    <div className={styles.radioCircle} />
                    <FontAwesomeIcon icon={faCreditCard} className={styles.icon} />
                    <span>Credit/Debit Card</span>
                  </div>
                  <span className={styles.expandIcon}>›</span>
                </div>
                {selectedPayment === 'card' && (
                  <div 
                    className={styles.cardForm}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.formGroup}>
                      <label>Name on card</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="Enter cardholder name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Card number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className={styles.expiryCvv}>
                      <div className={styles.formGroup}>
                        <label>Expiry date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div 
                className={`${styles.paymentOption} ${selectedPayment === 'cod' ? styles.selected : ''}`}
                onClick={() => selectPayment('cod')}
              >
                <div className={styles.paymentHeader}>
                  <div className={styles.paymentLeft}>
                    <div className={styles.radioCircle} />
                    <FontAwesomeIcon icon={faMoneyBillWave} className={styles.icon} />
                    <span>Cash on Delivery</span>
                  </div>
                  <span className={styles.expandIcon}>›</span>
                </div>
              </div>
            </div>

            {contextError && <div className={styles.error}>{contextError}</div>}
            
            <button type="submit" className={styles.submitButton}>
              Place Order
            </button>
          </form>
        </div>

        {/* Right Section (Order Summary) */}
        <div className={styles.orderSummary}>
          <h2>Your Order</h2>
          {cartItems.map((item) => (
            <div key={item.id} className={styles.item}>
              <img 
                src={item.url}
                alt={item.name}
                className={styles.itemImage}
              />
              <div className={styles.itemDetails}>
                <p>{item.name}</p>
                <p className={styles.itemPrice}>
                  PKR {item.price.toFixed(2)} 
                  <span className={styles.itemQuantity}>x {item.quantity || 1}</span>
                </p>
              </div>
            </div>
          ))}
          
          <div className={styles.summary}>
            <div><span>Subtotal</span><span>PKR {totals.subtotal}</span></div>
            <div><span>Delivery</span><span>PKR {totals.delivery}</span></div>
            <div><span>Tax</span><span>PKR {totals.tax}</span></div>
            {Number(totals.discount) > 0 && (
              <div><span>Discount</span><span>- PKR {totals.discount}</span></div>
            )}
            <div className={styles.total}>
              <span>Total</span>
              <span>PKR {totals.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
