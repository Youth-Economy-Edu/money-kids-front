import React from 'react';
import styles from './CardDetailPopup.module.css';

function CardDetailPopup({ title, content, onClose }) {
    return (
        <div className={styles['popup-overlay']}>
            <div className={styles['popup-content']}>
                <div className={styles['popup-title']}>{title}</div>
                <div className={styles['popup-description']}>{content}</div>
                <button className={styles['close-button']} onClick={onClose}>닫기</button>
            </div>
        </div>
    );
}

export default CardDetailPopup;
