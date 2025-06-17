import React, { useState, useEffect } from 'react';
import styles from './ConceptListPage.module.css';
import LearnCard from '../../components/Learn/LearnCard';
import CardDetailPopup from '../../components/Learn/CardDetailPopup';

// 예시용 더미 데이터
const dummyConcepts = [
    {
        id: 1,
        title: '돈이란 무엇인가?',
        content: '돈은 물건이나 서비스를 사고팔 때 사용하는 수단이에요. 예전에는 조개나 쌀을 썼지만, 지금은 동전과 지폐, 카드, 모바일 결제가 있어요.',
        difficulty: 1
    },
    {
        id: 2,
        title: '저축이 왜 중요할까?',
        content: '저축은 미래를 위해 돈을 아껴서 모으는 것이에요. 저축을 하면 사고 싶은 물건을 살 수 있고, 갑자기 필요한 일이 생겨도 걱정이 없어요.',
        difficulty: 2
    },
    // ... 실제 API로 받아올 데이터
];

const ConceptListPage = () => {
    const [selectedCard, setSelectedCard] = useState(null);
    const [concepts, setConcepts] = useState([]);

    useEffect(() => {
        // TODO: 백엔드 연동 시 여기를 fetch로 바꾸면 됨
        setConcepts(dummyConcepts);
    }, []);

    const handleCardClick = (card) => {
        setSelectedCard(card);
    };

    const handleClosePopup = () => {
        setSelectedCard(null);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.pageTitle}>경제 개념 배우기</h2>
            <div className={styles.cardGrid}>
                {concepts.map((concept) => (
                    <LearnCard
                        key={concept.id}
                        title={concept.title}
                        difficulty={concept.difficulty}
                        onClick={() => handleCardClick(concept)}
                    />
                ))}
            </div>

            {selectedCard && (
                <CardDetailPopup
                    title={selectedCard.title}
                    content={selectedCard.content}
                    onClose={handleClosePopup}
                />
            )}
        </div>
    );
};

export default ConceptListPage;
