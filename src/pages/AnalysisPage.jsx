import React, { useState, useEffect } from 'react';
import { analysisService } from '../services/analysisService';
import './AnalysisPage.css';

const AnalysisPage = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const userId = 'user123'; // 실제로는 로그인된 사용자 ID 사용

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 최신 분석 결과와 분석 이력을 병렬로 가져오기
      const [latestResult, history] = await Promise.allSettled([
        analysisService.getLatestResult(userId),
        analysisService.getAnalysisHistory(userId)
      ]);

      // 최신 분석 결과 처리
      if (latestResult.status === 'fulfilled') {
        if (latestResult.value && !latestResult.value.error) {
          setAnalysisResult(latestResult.value);
        } else if (latestResult.value?.error === 'NO_ANALYSIS_FOUND') {
          // 분석 결과가 없는 경우 - 정상적인 상황
          setAnalysisResult(null);
        }
      }
      
      // 분석 이력 처리
      if (history.status === 'fulfilled') {
        if (history.value?.code === 200) {
          setAnalysisHistory(history.value.data || []);
        } else if (history.value?.success && Array.isArray(history.value.data)) {
          setAnalysisHistory(history.value.data);
        }
      }
    } catch (error) {
      console.error('분석 데이터 로딩 실패:', error);
      setError('분석 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const performNewAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // 분석용 활동 로그 데이터 생성
      const analysisData = {
        userId: userId,
        activityLogs: [
          {
            type: "QUIZ",
            category: "경제기초",
            result: "CORRECT",
            timestamp: new Date().toISOString()
          },
          {
            type: "TRADE",
            category: "주식투자",
            result: "SUCCESS",
            timestamp: new Date().toISOString()
          },
          {
            type: "LOGIN",
            category: "시스템",
            result: "SUCCESS",
            timestamp: new Date().toISOString()
          }
        ]
      };

      const response = await analysisService.performAnalysis(analysisData);
      
      if (response && response.code === 200 && response.data) {
        setAnalysisResult(response.data);
        // 분석 완료 후 데이터 다시 로드
        await loadAnalysisData();
      } else if (response && response.error === 'SERVER_UNAVAILABLE') {
        setError(response.message);
      } else {
        setError(response?.msg || '성향 분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('성향 분석 실패:', error);
      if (error.message.includes('서버에 연결할 수 없습니다')) {
        setError('분석 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else {
        setError('성향 분석 중 오류가 발생했습니다.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="analysis-page-loading">
        <div className="loading-spinner"></div>
        <p>성향 분석 데이터를 불러오고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <div className="analysis-header">
        <h1>📊 경제 성향 분석</h1>
        <p>나의 투자 성향과 경제 관념을 분석해보세요</p>
      </div>

      <div className="analysis-actions">
        <button 
          className="btn-analyze"
          onClick={performNewAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? '분석 중...' : '새로운 성향 분석 시작'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {analysisResult ? (
        <div className="analysis-result">
          <div className="result-card main-result">
            <h2>🎯 분석 결과</h2>
            <div className="result-content">
              <div className="tendency-type">
                <h3>{analysisResult.type}</h3>
                <p className="feedback">{analysisResult.feedback}</p>
              </div>
              
              <div className="guidance">
                <h4>💡 맞춤 가이드</h4>
                <p>{analysisResult.guidance}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-analysis">
          <div className="no-analysis-content">
            <h3>아직 성향 분석 결과가 없습니다</h3>
            <p>첫 번째 성향 분석을 시작해보세요!</p>
            <div className="analysis-benefits">
              <h4>성향 분석의 장점:</h4>
              <ul>
                <li>개인 맞춤형 투자 가이드 제공</li>
                <li>경제 학습 방향 제시</li>
                <li>투자 위험도 파악</li>
                <li>성향 변화 추이 확인</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {analysisHistory.length > 0 && (
        <div className="analysis-history">
          <h3>📈 성향 변화 이력</h3>
          <div className="history-timeline">
            {analysisHistory.map((record, index) => (
              <div key={record.userId + index} className="history-item">
                <div className="history-date">
                  {formatDate(record.createdAt)}
                </div>
                <div className="history-content">
                  <h4>{record.analysisResult.finalType}</h4>
                  <p>{record.analysisResult.feedback}</p>
                  
                  {record.analysisResult.scores && (
                    <div className="mini-scores">
                      {Object.entries(record.analysisResult.scores).map(([key, value]) => (
                        <div key={key} className="mini-score">
                          <span>{key}</span>
                          <span>{value}점</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="analysis-tips">
        <h3>💡 성향 분석 팁</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>정확한 분석을 위해</h4>
            <p>다양한 경제 활동(퀴즈, 투자, 학습)을 꾸준히 해보세요.</p>
          </div>
          <div className="tip-card">
            <h4>성향 변화 관찰</h4>
            <p>정기적으로 분석을 받아 성향 변화를 추적해보세요.</p>
          </div>
          <div className="tip-card">
            <h4>맞춤형 학습</h4>
            <p>분석 결과를 바탕으로 개인에게 맞는 학습을 진행하세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage; 