import React from 'react';
import styles from './NoItemsFound.module.css'; 
import noItemsImage from '../assets/no-item.png.png'; 

const NoItemsFound = () => {
  return (
    <div className={styles.noItemsFound}>
      <img src={noItemsImage} alt="No items found" className={styles.noItemsImage} />
    </div>
  );
};

export default NoItemsFound;
