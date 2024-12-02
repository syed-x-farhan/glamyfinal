import React, { useState, useEffect } from 'react';
import styles from './Cart.module.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/cart_context';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateCartItem, removeFromCart } = useCart();
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDiscount] = useState(10); // Fixed discount amount
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const itemPrice = item.price || 0;
      const itemQuantity = item.quantity || 1; // Default to 1 if undefined
      return sum + (itemPrice * itemQuantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (voucherApplied ? voucherDiscount : 0);
  };

  const handleVoucherSubmit = () => {
    if (voucherCode === '10') {
      setVoucherApplied(true);
      setShowVoucherModal(false);
      setVoucherCode('');
    } else {
      alert('Invalid voucher code');
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherApplied(false);
  };

  const handleQuantityChange = (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      updateCartItem(itemId, newQuantity);
    }
  };

  console.log(cartItems.map(item => typeof item.price)); // Check the types of price

  useEffect(() => {
    console.log("Cart items in Cart component:", cartItems);
  }, [cartItems]);

  useEffect(() => {
    console.log('Current cart items:', cartItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        price: item.price,
        quantity: item.quantity
    })));
  }, [cartItems]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.cartSection}>
          <h1 className={styles.pageTitle}>Shopping Cart</h1>
          <div className={styles.cartItems}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <span 
                  className={styles.removeItem}
                  onClick={() => removeFromCart(item.id)}
                >
                  ✕
                </span>
                <div className={styles.itemImage}>
                  <img src={item.url || 'placeholder-image-url'} alt={item.name} />
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemPrice}>
                      PKR {typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
                    </p>
                    <p className={styles.itemMeta}>
                      Size: {item.size || 'M'}, Color: {item.color || 'Default'}
                    </p>
                  </div>
                  <div className={styles.quantityControls}>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.summarySection}>
          <span 
            className={styles.voucherLink}
            onClick={() => setShowVoucherModal(true)}
          >
            + Add Voucher Code
          </span>
          
          {voucherApplied && (
            <div className={styles.appliedVoucher}>
              <span>Voucher: PKR {voucherDiscount} off</span>
              <span 
                className={styles.removeVoucher}
                onClick={handleRemoveVoucher}
              >
                ✕
              </span>
            </div>
          )}
          
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <div className={styles.summaryItem}>
            <span>Subtotal</span>
            <span>PKR {calculateSubtotal().toFixed(2)}</span>
          </div>
          {voucherApplied && (
            <div className={styles.summaryItem}>
              <span>Voucher Discount</span>
              <span>-PKR {voucherDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className={`${styles.summaryItem} ${styles.delivery}`}>
            <span>Delivery</span>
            <span>Free</span>
          </div>
          <div className={`${styles.summaryItem} ${styles.total}`}>
            <span>Total</span>
            <span>PKR {calculateTotal().toFixed(2)}</span>
          </div>
          <button 
            className={styles.checkoutBtn}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div 
          className={styles.modal}
          onClick={() => setShowVoucherModal(false)}
        >
          <div 
            className={styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <span 
              className={styles.closeModal}
              onClick={() => setShowVoucherModal(false)}
            >
              ✕
            </span>
            <h2 className={styles.summaryTitle}>Apply Voucher</h2>
            <input
              type="text"
              className={styles.voucherInput}
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button 
              className={styles.applyBtn}
              onClick={handleVoucherSubmit}
            >
              Apply Code
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;