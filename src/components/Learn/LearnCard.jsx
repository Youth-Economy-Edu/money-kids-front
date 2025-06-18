import React from 'react';
import styles from './LearnCard.module.css';

function LearnCard({ id, title, onClick }) {
    return (
        <div className={styles['learn-card']} onClick={onClick}>
            <h3>{title}</h3>
        </div>
    );
}

export default LearnCard;
