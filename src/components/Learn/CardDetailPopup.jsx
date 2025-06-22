import React from 'react';
import styles from './CardDetailPopup.module.css';

function CardDetailPopup({ concept, onClose, onComplete }) {
    const handleComplete = () => {
        onComplete(concept.id);
        onClose();
    };

    return (
        <div className={styles['popup-overlay']}>
            <div className={styles['popup-content']}>
                <div className={styles['popup-title']}>{concept.title}</div>
                <div className={styles['popup-description']}>{concept.content}</div>
                <div className={styles['popup-actions']}>
                    <button className={styles['complete-button']} onClick={handleComplete}>
                        학습 완료
                    </button>
                    <button className={styles['close-button']} onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CardDetailPopup;
