import { useEffect, useState } from "react";
import ConceptCard from "../components/ConceptCard";
import { useNavigate } from 'react-router-dom';

const COLORS = ['#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'];

function ConceptListPage() {
    const navigate = useNavigate();
    const [selectedDifficulty, setSelectedDifficulty] = useState(0);
    const [conceptList, setConceptList] = useState([]);
    const [selectedConcept, setSelectedConcept] = useState(null);

    useEffect(() => {
        const fetchConceptList = async () => {
            try {
                let concepts = [];

                if (selectedDifficulty === 0) {
                    for (let level = 1; level <= 5; level++) {
                        const res = await fetch(`/api/worksheet/difficulty/${level}`);
                        const data = await res.json();

                        const levelConcepts = data.ids.map((item, idx) => ({
                            ...item,
                            color: COLORS[(concepts.length + idx) % COLORS.length],
                        }));

                        concepts = [...concepts, ...levelConcepts];
                    }
                } else {
                    const res = await fetch(`/api/worksheet/difficulty/${selectedDifficulty}`);
                    const data = await res.json();

                    concepts = data.ids.map((item, idx) => ({
                        ...item,
                        color: COLORS[idx % COLORS.length],
                    }));
                }

                setConceptList(concepts);
            } catch (error) {
                console.error("개념 목록 불러오기 실패:", error);
            }
        };

        fetchConceptList();
    }, [selectedDifficulty]);

    const handleConceptClick = async (id) => {
        try {
            const res = await fetch(`/api/worksheet/${id}`);
            const json = await res.json();

            if (json.code === 200 && json.data) {
                setSelectedConcept({
                    ...json.data,
                    color: COLORS[id % COLORS.length],
                });
            } else {
                alert("개념 정보를 불러올 수 없습니다.");
            }
        } catch (e) {
            console.error("개념 상세 실패:", e);
        }
    };

    return (
        <div style={{ padding: '32px', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '16px' }}>경제 개념 목록</h1>

            <div style={{ marginBottom: '24px' }}>
                {[0, 1, 2, 3, 4, 5].map((level) => (
                    <button
                        key={level}
                        style={{
                            margin: '4px',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#0000ac',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                        onClick={() => setSelectedDifficulty(level)}
                    >
                        {level === 0 ? '전체' : `${level}단계`}
                    </button>
                ))}
            </div>

            {/* 카드 리스트 - Grid 버전 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                justifyContent: 'center',
                gap: '24px',
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 16px'
            }}>
                {conceptList.map((concept) => (
                    <ConceptCard
                        key={concept.id}
                        title={concept.title}
                        description={concept.description}
                        questionCount={concept.questionCount || 0}
                        progress={concept.progress || 0}
                        color={concept.color}
                        onClick={() => handleConceptClick(concept.id)}
                    />
                ))}
            </div>

            {/* 퀴즈 버튼 */}
            <div style={{ marginTop: '48px' }}>
                <button
                    onClick={() => navigate('/quiz')}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: '#8b5cf6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    퀴즈
                </button>
            </div>

            {/* 모달 */}
            {selectedConcept && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#0f0f1b',
                        color: '#fff',
                        padding: '24px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '70vh',
                        overflowY: 'auto',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        textAlign: 'left',
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                            {selectedConcept.title}
                        </h2>
                        <p style={{
                            marginBottom: '8px',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                            color: '#f3f4f6',
                            fontSize: '16px',
                        }}>
                            {selectedConcept.content}
                        </p>
                        <div style={{ textAlign: 'right' }}>
                            <button
                                onClick={() => setSelectedConcept(null)}
                                style={{
                                    marginTop: '16px',
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ConceptListPage;