import React, { useState, useEffect } from 'react';
import { parentService } from '../services/parentService.js';
import './ParentPage.css';

const ParentPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [tendencyData, setTendencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 임시 자녀 ID (실제로는 로그인한 사용자 정보에서 가져와야 함)
  const childId = 'user123';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 대시보드 데이터와 성향 그래프 데이터를 병렬로 가져오기
        const [dashboardResponse, tendencyResponse] = await Promise.all([
          parentService.getDashboard(childId),
          parentService.getTendencyGraph(childId)
        ]);

        if (dashboardResponse.code === 200) {
          setDashboardData(dashboardResponse.data);
        }
        
        if (tendencyResponse.code === 200) {
          setTendencyData(tendencyResponse.data);
        }
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [childId]);

  if (loading) {
    return (
      <div className="parent-page-loading">
        <div className="loading-spinner"></div>
        <p>자녀의 경제 교육 현황을 불러오고 있습니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="parent-page-error">
        <h3>오류 발생</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  const profile = dashboardData?.profile;
  const recentActivity = dashboardData?.recentActivity;
  const learningProgress = dashboardData?.learningProgress;
  const investment = dashboardData?.investment;

  return (
    <div className="parent-page">
      <div className="parent-header">
        <h1>🏠 학부모 대시보드</h1>
        <p>자녀의 경제 교육 현황을 한눈에 확인하세요</p>
      </div>

      <div className="dashboard-grid">
        {/* 자녀 프로필 카드 */}
        <div className="card profile-card">
          <h3>👤 자녀 프로필</h3>
          {profile ? (
            <div className="profile-info">
              <p><strong>이름:</strong> {profile.name}</p>
              <p><strong>레벨:</strong> {profile.level}</p>
              <p><strong>포인트:</strong> {profile.points?.toLocaleString()}P</p>
              <p><strong>다음 레벨까지:</strong> {profile.nextLevelPoints?.toLocaleString()}P</p>
              <div className="level-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${(profile.points / profile.nextLevelPoints) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <p>프로필 정보를 불러올 수 없습니다.</p>
          )}
        </div>

        {/* 경제 성향 */}
        <div className="card tendency-card">
          <h3>📊 경제 성향</h3>
          {tendencyData ? (
            <div className="tendency-info">
              <p><strong>성향 유형:</strong> {tendencyData.finalType}</p>
              <p><strong>피드백:</strong> {tendencyData.feedback}</p>
              <p><strong>가이드:</strong> {tendencyData.guidance}</p>
              <small>마지막 분석: {new Date(tendencyData.lastAnalyzedAt).toLocaleDateString()}</small>
              
              <div className="tendency-scores">
                <h4>세부 점수</h4>
                {Object.entries(tendencyData.scores || {}).map(([key, value]) => (
                  <div key={key} className="score-item">
                    <span>{key}</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                    <span>{value}점</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>성향 분석 데이터가 없습니다.</p>
          )}
        </div>

        {/* 학습 성과 */}
        <div className="card learning-card">
          <h3>📚 학습 성과</h3>
          {learningProgress ? (
            <div className="learning-info">
              <p><strong>총 퀴즈 수:</strong> {learningProgress.totalQuizzes}개</p>
              <p><strong>정답 수:</strong> {learningProgress.correctAnswers}개</p>
              <p><strong>정답률:</strong> {learningProgress.accuracyRate}%</p>
              <p><strong>획득 포인트:</strong> {learningProgress.totalPointsEarned?.toLocaleString()}P</p>
              <p><strong>현재 레벨:</strong> {learningProgress.currentLevel}</p>
              
              {learningProgress.recentTrend && (
                <div className="recent-trend">
                  <h4>최근 정답률 추이</h4>
                  {learningProgress.recentTrend.map((trend, index) => (
                    <div key={index} className="trend-item">
                      <span>배치 {trend.batch}</span>
                      <span>{trend.accuracy}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p>학습 성과 데이터가 없습니다.</p>
          )}
        </div>

        {/* 투자 현황 */}
        <div className="card investment-card">
          <h3>💰 투자 현황</h3>
          {investment ? (
            <div className="investment-info">
              {investment.hasInvestments ? (
                <>
                  <p><strong>보유 주식 수:</strong> {investment.totalStocks}개</p>
                  <p><strong>총 투자금액:</strong> {investment.totalValue?.toLocaleString()}원</p>
                  <div className="investment-status good">
                    ✅ 투자 활동 중
                  </div>
                </>
              ) : (
                <div className="investment-status inactive">
                  ❌ 아직 투자를 시작하지 않았습니다
                  <p>투자 시뮬레이션을 권장해보세요!</p>
                </div>
              )}
            </div>
          ) : (
            <p>투자 현황 데이터가 없습니다.</p>
          )}
        </div>

        {/* 최근 활동 */}
        <div className="card activity-card">
          <h3>🎯 최근 활동 (7일)</h3>
          {recentActivity ? (
            <div className="activity-info">
              <p><strong>총 활동 수:</strong> {recentActivity.totalActivities}개</p>
              <p><strong>평균 일일 활동:</strong> {recentActivity.averageActivitiesPerDay}개</p>
              <p><strong>가장 활발한 요일:</strong> {recentActivity.mostActiveDay}</p>
              
              <div className="activity-breakdown">
                <h4>활동 유형별</h4>
                {Object.entries(recentActivity.activityByType || {}).map(([type, count]) => (
                  <div key={type} className="activity-type">
                    <span>{type}</span>
                    <span>{count}회</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>활동 데이터가 없습니다.</p>
          )}
        </div>

        {/* 교육 추천사항 */}
        <div className="card recommendations-card full-width">
          <h3>💡 맞춤형 교육 가이드</h3>
          <div className="recommendations-placeholder">
            <p>자녀의 학습 패턴과 성향을 분석하여 맞춤형 교육 방법을 제안해드립니다.</p>
            <button 
              className="btn-recommendations"
              onClick={() => parentService.getRecommendations(childId)}
            >
              교육 추천사항 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPage; 