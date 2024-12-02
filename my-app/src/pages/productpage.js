import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/cart_context';
import { useSave } from '../context/save_context';
import { useAuth } from '../context/sign-in_sign-up_context';
import styles from './productpage.module.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBookmark as faBookmarkSolid,
  faPaperPlane,
  faCartPlus
} from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular, faPaperPlane as faPaperPlaneRegular } from '@fortawesome/free-regular-svg-icons';

const ProductPage = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const { savedItems, toggleSaveItem } = useSave();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isSaved = savedItems.some(item => item.id === Number(productId));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with ID:', productId);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products/product/${productId}`,
          { withCredentials: true }
        );
        
        // Process the product data
        const processedProduct = {
          ...response.data,
          // Ensure price is a proper number
          price: Number(parseFloat(response.data.price).toFixed(2))
        };
        
        console.log('Processed product:', processedProduct);
        setProduct(processedProduct);
        setMainImage(response.data.url);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const hardcodedRating = 4;
  const hardcodedDescription = product.description || "This is a sample description for our product. More details coming soon!";

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    if (!user) {
      // Handle not logged in state - maybe show a message or redirect to login
      alert('Please log in to save items');
      return;
    }

    if (!isSaving) {
      setIsSaving(true);
      try {
        await toggleSaveItem(product);
      } catch (error) {
        console.error('Error saving product:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleShareClick = async () => {
    // Get the current URL
    const shareUrl = window.location.href;
    
    // Prepare share data
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on Glamy - Rs. ${product.price}`,
      url: shareUrl
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Shared successfully');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        );
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Share was cancelled');
      } else {
        console.error('Error sharing:', error);
        // Fallback if sharing fails
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        } catch (clipboardError) {
          console.error('Error copying to clipboard:', clipboardError);
          alert('Could not share or copy link. Please try again.');
        }
      }
    }
  };

  return (
    <div className={styles.productPage}>
      <div className={styles.imageSection}>
        <img
          src={mainImage || "https://via.placeholder.com/500"}
          alt={product.name}
          className={styles.mainImage}
          onError={(e) => {
            console.log('Image failed to load:', e.target.src);
            e.target.src = "https://via.placeholder.com/500";
          }}
        />
      </div>

      <div className={styles.detailsSection}>
        <h1>{product.name}</h1>
        <div className={styles.starReviews}>
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={styles.starIcon}
              style={{ color: i < hardcodedRating ? '#ffcc00' : '#4a4a4a' }}
            >
              ⭐
            </span>
          ))}
        </div>

        <div className={styles.priceQuantity}>
          <span className={styles.price}>
            Rs. {Number(product.price).toFixed(2)}
          </span>
          <div className={styles.quantity}>
            <label>Qty:</label>
            <button onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
            <span>{quantity}</span>
            <button onClick={increaseQuantity}>+</button>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={handleAddToCart} className={styles.addToCart}>
            <FontAwesomeIcon icon={faCartPlus} className={styles.cartIcon} />
            <span>Add to Cart</span>
          </button>
          <button 
            className={`${styles.iconButton} ${isSaved ? styles.saved : ''}`}
            onClick={handleSaveClick} 
            disabled={isSaving}
            title={isSaved ? "Unsave" : "Save"}
          >
            <FontAwesomeIcon 
              icon={isSaved ? faBookmarkSolid : faBookmarkRegular}
              className={styles.icon}
            />
          </button>
          <button 
            className={styles.iconButton} 
            onClick={handleShareClick}
            title="Share"
          >
            <FontAwesomeIcon 
              icon={faPaperPlaneRegular}
              className={styles.icon}
            />
          </button>
        </div>

        <div className={styles.productDescription}>
          <h3>Product Description</h3>
          <p>{hardcodedDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;