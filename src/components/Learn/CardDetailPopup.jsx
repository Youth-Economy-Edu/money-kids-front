import React from 'react';
import styles from './CardDetailPopup.module.css';

const CardDetailPopup = ({ title, content, onClose }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.content}>{content}</p>
            </div>
        </div>
    );
};

export default CardDetailPopup;
