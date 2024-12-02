import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import styles from "./CompleteOrder.module.css"; 

const CompleteOrder = () => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.container}>
      {showConfetti && <Confetti />} 
      <h1>Thank you for shopping at Glamy!</h1>
    </div>
  );
};

export default CompleteOrder;
