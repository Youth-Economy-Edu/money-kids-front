import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { tendencyAPI } from '../../utils/api';
import './Recommendations.css';

const Recommendations = () => {
    const [recommendationsData, setRecommendationsData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // 로그인한 유저의 ID를 localStorage에서 가져오기
    const childId = localStorage.getItem("userId") || "user001"; // 기본값으로 user001 사용

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await tendencyAPI.getRecommendations(childId);
                if (result.success) {
                    setRecommendationsData(result.data);
                } else {
                    console.warn('API 호출 실패, 목업 데이터 사용:', result.error);
                    // API 실패 시 목업 데이터 사용
                    setRecommendationsData({
                        tendencyBasedAdvice: "위험도가 낮은 대형주 위주로 투자해보세요.",
                        recommendedLearningAreas: [
                            "균형잡힌 투자 포트폴리오",
                            "기본 경제 원리 복습",
                            "리스크 관리 방법",
                            "장기 투자 전략"
                        ],
                        learningRecommendations: [
                            "중급 수준의 경제 학습을 권장합니다.",
                            "투자 시뮬레이션을 더 활용해보세요.",
                            "경제 뉴스를 정기적으로 읽어보세요.",
                            "다양한 투자 상품에 대해 학습해보세요."
                        ],
                        investmentRecommendations: [
                            "다양한 업종의 주식에 분산 투자해보세요.",
                            "투자 결과를 정기적으로 검토해보세요.",
                            "감정적 투자보다는 계획적 투자를 하세요.",
                            "소액으로 시작해서 점진적으로 늘려가세요."
                        ],
                        personalizedTips: [
                            {
                                category: "학습",
                                tip: "현재 정답률이 80%로 우수합니다. 더 어려운 문제에 도전해보세요!",
                                priority: "high"
                            },
                            {
                                category: "투자",
                                tip: "IT 업종에 집중되어 있습니다. 다른 업종도 고려해보세요.",
                                priority: "medium"
                            },
                            {
                                category: "활동",
                                tip: "주말 활동이 적습니다. 꾸준한 학습 습관을 만들어보세요.",
                                priority: "low"
                            }
                        ]
                    });
                }
            } catch (error) {
                console.error('예상치 못한 오류:', error);
                // 목업 데이터 사용
                setRecommendationsData({
                    tendencyBasedAdvice: "위험도가 낮은 대형주 위주로 투자해보세요.",
                    recommendedLearningAreas: [
                        "균형잡힌 투자 포트폴리오",
                        "기본 경제 원리 복습",
                        "리스크 관리 방법",
                        "장기 투자 전략"
                    ],
                    learningRecommendations: [
                        "중급 수준의 경제 학습을 권장합니다.",
                        "투자 시뮬레이션을 더 활용해보세요.",
                        "경제 뉴스를 정기적으로 읽어보세요.",
                        "다양한 투자 상품에 대해 학습해보세요."
                    ],
                    investmentRecommendations: [
                        "다양한 업종의 주식에 분산 투자해보세요.",
                        "투자 결과를 정기적으로 검토해보세요.",
                        "감정적 투자보다는 계획적 투자를 하세요.",
                        "소액으로 시작해서 점진적으로 늘려가세요."
                    ],
                    personalizedTips: [
                        {
                            category: "학습",
                            tip: "현재 정답률이 80%로 우수합니다. 더 어려운 문제에 도전해보세요!",
                            priority: "high"
                        },
                        {
                            category: "투자",
                            tip: "IT 업종에 집중되어 있습니다. 다른 업종도 고려해보세요.",
                            priority: "medium"
                        },
                        {
                            category: "활동",
                            tip: "주말 활동이 적습니다. 꾸준한 학습 습관을 만들어보세요.",
                            priority: "low"
                        }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [childId]);

    if (loading) {
        return (
            <MainLayout title="교육 추천" levelText="초급자">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>데이터를 불러오는 중...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="교육 추천" levelText="초급자">
            <div className="recommendations-container">
                {/* 성향 기반 조언 */}
                <div className="advice-section">
                    <div className="section-card highlight">
                        <h2>🎯 맞춤형 투자 조언</h2>
                        <div className="advice-content">
                            <div className="advice-text">
                                {recommendationsData?.tendencyBasedAdvice}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 개인화된 팁 */}
                <div className="tips-section">
                    <div className="section-card">
                        <h2>💡 개인화된 팁</h2>
                        <div className="tips-list">
                            {recommendationsData?.personalizedTips?.map((tip, index) => (
                                <div key={index} className={`tip-item priority-${tip.priority}`}>
                                    <div className="tip-header">
                                        <span className="tip-category">{tip.category}</span>
                                        <span className={`priority-badge ${tip.priority}`}>
                                            {tip.priority === 'high' ? '높음' : 
                                             tip.priority === 'medium' ? '보통' : '낮음'}
                                        </span>
                                    </div>
                                    <div className="tip-content">
                                        {tip.tip}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 학습 추천 */}
                <div className="learning-section">
                    <div className="section-card">
                        <h2>📚 학습 추천</h2>
                        <div className="recommendations-grid">
                            <div className="recommendation-category">
                                <h3>추천 학습 영역</h3>
                                <ul className="recommendation-list">
                                    {recommendationsData?.recommendedLearningAreas?.map((area, index) => (
                                        <li key={index} className="recommendation-item">
                                            <span className="item-icon">📖</span>
                                            <span>{area}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="recommendation-category">
                                <h3>학습 방법 제안</h3>
                                <ul className="recommendation-list">
                                    {recommendationsData?.learningRecommendations?.map((rec, index) => (
                                        <li key={index} className="recommendation-item">
                                            <span className="item-icon">💡</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 투자 추천 */}
                <div className="investment-section">
                    <div className="section-card">
                        <h2>📈 투자 추천</h2>
                        <div className="investment-recommendations">
                            <ul className="recommendation-list">
                                {recommendationsData?.investmentRecommendations?.map((rec, index) => (
                                    <li key={index} className="recommendation-item">
                                        <span className="item-icon">💰</span>
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 다음 단계 */}
                <div className="next-steps-section">
                    <div className="section-card">
                        <h2>🚀 다음 단계</h2>
                        <div className="next-steps-content">
                            <div className="step-item">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>학습 계획 세우기</h4>
                                    <p>추천된 학습 영역을 바탕으로 주간 학습 계획을 세워보세요.</p>
                                </div>
                            </div>
                            
                            <div className="step-item">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>포트폴리오 다양화</h4>
                                    <p>현재 투자 포트폴리오를 검토하고 분산투자를 고려해보세요.</p>
                                </div>
                            </div>
                            
                            <div className="step-item">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>정기적인 점검</h4>
                                    <p>월 1회 학습 성과와 투자 결과를 점검하는 습관을 만들어보세요.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Recommendations;
