import React from 'react';
import Sidebar from './components/Sidebar/sidebar';
import Header from './components/Header/header';
import ConceptListPage from './pages/Learn/ConceptListPage';
import QuizPage from './pages/Quiz/QuizPage';
import QuizSolvePage from './pages/Quiz/QuizSolvePage';
import ResultPage from './pages/Quiz/QuizResultPage'; // 여기를 수정 (QuizResultPage → ResultPage)
import NewsPage from './pages/NewsPage';
import './styles/components.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import TendencyAnalysis from './pages/TendencyAnalysis/TendencyAnalysis'
import TendencyDetail from './pages/TendencyAnalysis/TendencyDetail'
import LearningProgress from './pages/TendencyAnalysis/LearningProgress'
import InvestmentPortfolio from './pages/TendencyAnalysis/InvestmentPortfolio'
import ActivityMonitoring from './pages/TendencyAnalysis/ActivityMonitoring'
import Recommendations from './pages/TendencyAnalysis/Recommendations'
import './App.css'

// 홈 페이지 컴포넌트
const HomePage = () => (
  <div className="welcome-content">
    <h1>Money Kids에 오신 것을 환영합니다!</h1>
    <p>경제 교육을 통해 스마트한 금융 습관을 기르세요.</p>

    <div className="feature-cards">
      <div className="feature-card">
        <h3>📚 경제 학습</h3>
        <p>기초부터 고급까지 체계적인 경제 교육</p>
      </div>

      <div className="feature-card">
        <h3>📈 모의 투자</h3>
        <p>안전한 환경에서 투자 경험 쌓기</p>
      </div>

      <div className="feature-card">
        <h3>📊 성향 분석</h3>
        <p>나만의 투자 성향 파악하기</p>
      </div>

      <div className="feature-card">
        <h3>📰 경제 뉴스</h3>
        <p>최신 경제 동향과 뉴스 확인</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <MainLayout title="홈" levelText="초급자">
          <HomePage />
        </MainLayout>
      } />
      <Route path="/tendency" element={<TendencyAnalysis />} />
      <Route path="/tendency/detail" element={<TendencyDetail />} />
      <Route path="/tendency/learning" element={<LearningProgress />} />
      <Route path="/tendency/investment" element={<InvestmentPortfolio />} />
      <Route path="/tendency/activity" element={<ActivityMonitoring />} />
      <Route path="/tendency/recommendations" element={<Recommendations />} />
      <Route path="/tendency/detail" element={<TendencyDetail />} />
      <Route path="/tendency/learning" element={<LearningProgress />} />
      <Route path="/tendency/investment" element={<InvestmentPortfolio />} />
      <Route path="/tendency/activity" element={<ActivityMonitoring />} />
      <Route path="/tendency/recommendations" element={<Recommendations />} />
      <Route path="/learn" element={
        <MainLayout title="경제 학습" levelText="초급자">
          <div>경제 학습 페이지 (준비 중)</div>
        </MainLayout>
      } />
      <Route path="/investment" element={
        <MainLayout title="모의 투자" levelText="초급자">
          <div>모의 투자 페이지 (준비 중)</div>
        </MainLayout>
      } />
      <Route path="/news" element={
        <MainLayout title="경제 뉴스" levelText="초급자">
          <div>경제 뉴스 페이지 (준비 중)</div>
        </MainLayout>
      } />
    </Routes>
  )
function App() {
    return (
        <Router>
            <div className="app">
                <Sidebar />
                <div className="main-content">
                    <Header />
                    <main className="content">
                        <Routes>
                            <Route path="/" element={<HomePlaceholder />} />
                            <Route path="/learn" element={<ConceptListPage />} />
                            <Route path="/quiz" element={<QuizPage />} />
                            <Route path="/quiz/solve" element={<QuizSolvePage />} />
                            <Route path="/quiz/result" element={<ResultPage />} />
                            <Route path="/invest" element={<PlaceholderPage title="모의 투자" />} />
                            <Route path="/parent" element={<PlaceholderPage title="학부모 페이지" />} />
                            <Route path="/analysis" element={<PlaceholderPage title="성향 분석" />} />
                            <Route path="/news" element={<NewsPage />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

const HomePlaceholder = () => (
    <div className="placeholder">홈 페이지는 준비 중입니다.</div>
);

const PlaceholderPage = ({ title }) => (
    <div className="placeholder">{title} 페이지는 준비 중입니다.</div>
);

export default App;
