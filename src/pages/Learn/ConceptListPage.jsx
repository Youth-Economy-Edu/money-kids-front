import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LearnCard from '../../components/Learn/LearnCard';
import CardDetailPopup from '../../components/Learn/CardDetailPopup';
import styles from './ConceptListPage.module.css';

const fetchConcepts = async (difficulty) => {
    try {
        if (difficulty) {
            const response = await fetch(`/api/worksheet/difficulty/${difficulty}`);
            if (!response.ok) throw new Error('불러오기 실패');
            const result = await response.json();
            return result.ids || [];
        } else {
            const allResults = [];
            for (let i = 1; i <= 5; i++) {
                const res = await fetch(`/api/worksheet/difficulty/${i}`);
                if (res.ok) {
                    const resData = await res.json();
                    const items = resData.ids || [];
                    allResults.push(...items);
                }
            }
            return allResults;
        }
    } catch (err) {
        console.error(err);
        return [];
    }
};

const fetchConceptDetail = async (id) => {
    try {
        const response = await fetch(`/api/worksheet/${id}`);
        if (!response.ok) throw new Error('상세 불러오기 실패');
        const result = await response.json();
        return result.data;  // ✅ 핵심 수정 부분
    } catch (err) {
        console.error(err);
        return null;
    }
};

function ConceptListPage() {
    const [concepts, setConcepts] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [selectedConcept, setSelectedConcept] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchConcepts(selectedDifficulty).then(setConcepts);
    }, [selectedDifficulty]);

    const handleCardClick = async (id) => {
        const detail = await fetchConceptDetail(id);
        setSelectedConcept(detail);
    };

    const handleQuizStart = () => {
        navigate('/quiz');
    };

    return (
        <div className={styles['concept-page']}>
            <div className={styles['difficulty-buttons']}>
                <button className={!selectedDifficulty ? styles['active'] : ''} onClick={() => setSelectedDifficulty(null)}>전체</button>
                {[1, 2, 3, 4, 5].map(level => (
                    <button key={level}
                            className={selectedDifficulty === level ? styles['active'] : ''}
                            onClick={() => setSelectedDifficulty(level)}>
                        난이도 {level}
                    </button>
                ))}
            </div>

            <div className={styles['card-grid']}>
                {concepts.length === 0 ? (
                    <p>학습 데이터가 없습니다.</p>
                ) : (
                    concepts.map(concept => (
                        <LearnCard
                            key={concept.id}
                            id={concept.id}
                            title={concept.title}
                            onClick={() => handleCardClick(concept.id)}
                        />
                    ))
                )}
            </div>

            <div className={styles['quiz-button-container']}>
                <button className={styles['quiz-button']} onClick={handleQuizStart}>
                    퀴즈 풀기 🎯
                </button>
            </div>

            {selectedConcept && (
                <CardDetailPopup
                    title={selectedConcept.title}
                    content={selectedConcept.content}
                    onClose={() => setSelectedConcept(null)}
                />
            )}
        </div>
    );
}

export default ConceptListPage;
