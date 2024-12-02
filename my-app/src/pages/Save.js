import React from 'react';
import { useSave } from '../context/save_context';
import { useAuth } from '../context/sign-in_sign-up_context';
import styles from './Save.module.css';

const Save = () => {
  const { savedItems } = useSave();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className={styles['save-container']}>
        <p className={styles['empty-message']}>
          Please log in to view your saved items!
        </p>
      </div>
    );
  }

  return (
    <div className={styles['save-container']}>
      <h1 className={styles['page-title']}>Saved Items</h1>
      {savedItems.length === 0 ? (
        <p className={styles['empty-message']}>
          Ain't nobody got time for an empty save list! Where's the love? It's like showing up to a potluck with no food! We gotta fix this!
        </p>
      ) : (
        <div className={styles['saved-items']}>
          {savedItems.map((item) => (
            <div key={item.id} className={styles['saved-card']}>
              <img src={item.url || 'placeholder-image-url'} alt={item.name} className={styles['saved-image']} />
              <div className={styles['saved-content']}>
                <h3>{item.name}</h3>
                <p>Price: PKR {item.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Save;
