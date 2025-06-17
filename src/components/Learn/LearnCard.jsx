import React from 'react';
import styles from './LearnCard.module.css';

const LearnCard = ({ title, difficulty, onClick }) => {
    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.topRow}>
                <span className={styles.difficulty}>난이도 {difficulty}</span>
            </div>
            <h3 className={styles.title}>{title}</h3>
        </div>
    );
};

export default LearnCard;
