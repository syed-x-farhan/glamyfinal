import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useHome } from '../context/home_context';
import styles from './Home.module.css';
import SaveButton from './SaveComponent';

function Home() {
  const { items, setItems, loading, error, handleSwipe } = useHome();
  const cardRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length > 0) {
      setCurrentIndex(items.length - 1);
    }
  }, [items]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log("User data in Home:", {
      user,
      userId: user?.user_id || user?.id,
      allKeys: user ? Object.keys(user) : []
    });
  }, []);

  useEffect(() => {
    console.log("All localStorage data:", {
      user: localStorage.getItem('user'),
      token: localStorage.getItem('token'),
      parsedUser: JSON.parse(localStorage.getItem('user')),
      allKeys: Object.keys(localStorage)
    });
  }, []);

  const applySwipeOverlay = (direction, index) => {
    const card = cardRefs.current[index];
    if (card) {
      card.classList.add(styles[`swipe-${direction}`]);
      setTimeout(() => {
        card.classList.remove(styles[`swipe-${direction}`]);
      }, 300);
    }
  };

  const removeCard = useCallback(
    (direction, index) => {
      if (items.length === 0 || index < 0) return;

      const card = cardRefs.current[index];
      if (card) {
        applySwipeOverlay(direction, index);

        card.classList.add(styles[`swipe-out-${direction}`]);
        setTimeout(async () => {
          if (direction === 'right') {
            const currentItem = items[index];
            console.log("Swiping right, item data:", {
              fullItem: currentItem,
              id: currentItem.id,
              product_id: currentItem.product_id || currentItem.id,
              price: currentItem.price,
              name: currentItem.name
            });
            
            try {
              await handleSwipe(currentItem);
              console.log('handleSwipe completed');
            } catch (error) {
              console.error('Error in swipe action:', error);
            }
          }

          setItems((prevItems) => {
            const newItems = prevItems.filter((_, idx) => idx !== index);
            setCurrentIndex((prevIndex) => Math.min(prevIndex, newItems.length - 1));
            return newItems;
          });
        }, 300);
      }
    },
    [handleSwipe, items, setItems]
  );

  const handleKeySwipe = useCallback(
    (e) => {
      if (items.length === 0 || currentIndex < 0) return;
      if (e.key === 'ArrowRight') {
        removeCard('right', currentIndex);
      } else if (e.key === 'ArrowLeft') {
        removeCard('left', currentIndex);
      }
    },
    [currentIndex, items, removeCard]
  );

  const onSwipeStart = (index, e) => {
    if (items.length === 0 || index < 0) return;

    const card = cardRefs.current[index];
    if (!card) return;

    let startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    let currentX = 0;

    const onSwipeMove = (moveEvent) => {
      currentX = (moveEvent.type === 'mousemove' ? moveEvent.clientX : moveEvent.touches[0].clientX) - startX;
      card.style.transform = `translateX(${currentX}px)`;
    };

    const onSwipeEnd = () => {
      document.removeEventListener('mousemove', onSwipeMove);
      document.removeEventListener('mouseup', onSwipeEnd);
      document.removeEventListener('touchmove', onSwipeMove);
      document.removeEventListener('touchend', onSwipeEnd);

      if (Math.abs(currentX) > 100) {
        const direction = currentX > 0 ? 'right' : 'left';
        removeCard(direction, index);
      } else {
        card.style.transform = 'translateX(0)';
      }
    };

    document.addEventListener('mousemove', onSwipeMove);
    document.addEventListener('mouseup', onSwipeEnd);
    document.addEventListener('touchmove', onSwipeMove);
    document.addEventListener('touchend', onSwipeEnd);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeySwipe);
    return () => {
      document.removeEventListener('keydown', handleKeySwipe);
    };
  }, [handleKeySwipe]);

  const onSwipe = (item) => {
    handleSwipe(item);
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (error) {
    return <div>{error}</div>; 
  }

  return (
    <div className={styles['home-container']}>
      {items.length > 0 ? (
        <div className={styles['cardContainer']}>
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => (cardRefs.current[index] = el)}
              className={`${styles.card} ${index === currentIndex ? styles.active : ''}`}
              style={{ backgroundImage: `url(${item.url || 'placeholder-image-url'})` }}
              onMouseDown={(e) => onSwipeStart(index, e)}
              onTouchStart={(e) => onSwipeStart(index, e)}
              onSwipe={() => onSwipe(item)}
            >
              <SaveButton item={item} disabled={index !== currentIndex} />
              <div className={styles['card-content']}>
                <h3>{item.name}</h3>
                <p>PKR {item.price}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles['noCardsMessage']}>
          <h2>"Ain't no more cards left! You done swiped through 'em all! Go on, take a break!"</h2>
        </div>
      )}
    </div>
  );
}

export default Home;
