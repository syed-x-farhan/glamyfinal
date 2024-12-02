import React, { useCallback, useState } from 'react';
import { FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { useSave } from '../context/save_context';
import styles from './Home.module.css';

function SaveButton({ item, disabled }) {
  const { savedItems, toggleSaveItem } = useSave();
  const [isSaving, setIsSaving] = useState(false);
  const isSaved = savedItems.some((savedItem) => savedItem.id === item.id);

  const handleClick = useCallback(
    async (e) => {
      e.stopPropagation();
      if (!disabled && !isSaving) {
        setIsSaving(true);
        try {
          await toggleSaveItem(item);
        } catch (error) {
          console.error('Error saving item:', error);
        } finally {
          setIsSaving(false);
        }
      }
    },
    [item, toggleSaveItem, disabled, isSaving]
  );

  return (
    <button
      className={`${styles['save-button']} ${isSaved ? styles['filled'] : ''} ${isSaving ? styles['saving'] : ''}`}
      onClick={handleClick}
      disabled={disabled || isSaving}
    >
      {isSaved ? <FaBookmark /> : <FaRegBookmark />}
    </button>
  );
}

export default SaveButton;