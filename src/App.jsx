import React from 'react';
import Sidebar from './components/Sidebar/sidebar';
import Header from './components/Header/header';
import ConceptListPage from './pages/Learn/ConceptListPage';
import QuizPage from './pages/Quiz/QuizPage';
import QuizSolvePage from './pages/Quiz/QuizSolvePage';
import ResultPage from './pages/Quiz/QuizResultPage'; // 여기를 수정 (QuizResultPage → ResultPage)
import NewsPage from './pages/NewsPage';
import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InvestmentPage from './pages/InvestmentPage';

import UserDebugPage from './pages/UserDebugPage';
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
// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar/sidebar";
import Header from "./components/Header/header";
import Home from "./pages/Home/home.jsx";
import Login from "./pages/Login/login.jsx";
import Register from "./pages/Register/register.jsx";
import "./App.css";

export const ROUTES = {
    LOGIN: "/login",
    REGISTER: "/register",
    HOME: "/home",
};

const getHeaderTitle = (menuId, userName) => {
    switch (menuId) {
        case "home":
            return `안녕하세요, ${userName}님! 👋`;
        case "learn":
            return "경제 공부를 시작해볼까요? 📘";
        case "invest":
            return "모의 투자 거래 현황 📈";
        case "parent":
            return "학부모 전용 안내 페이지 🧑‍🏫";
        case "analysis":
            return "나의 투자 성향 분석 🧠";
        case "news":
            return "오늘의 경제 뉴스 📰";
        default:
            return "";
    }
};

function App() {
    const [selectedMenu, setSelectedMenu] = useState("home");
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("userId"));
    const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");
  // 기본 페이지를 '모의 투자'로 설정
  const [currentPage, setCurrentPage] = useState('모의투자');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

    const handleLogin = (username) => {
        setIsLoggedIn(true);
        setUserName(username);
        localStorage.setItem("userId", username);
        localStorage.setItem("userName", username);
    };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

    const renderLayout = (content) => (
        <div className="layout">
            <Sidebar onSelectMenu={setSelectedMenu} />
            <div className="main-content">
                <Header title={getHeaderTitle(selectedMenu, userName)} />
                <div className="content-area">{content}</div>
            </div>
        </div>
    );

    return (
        <Router>
            <Routes>
                <Route path={ROUTES.LOGIN} element={<Login onLogin={handleLogin} />} />
                <Route path={ROUTES.REGISTER} element={<Register />} />
                <Route path={ROUTES.HOME} element={renderLayout(<Home onNavigate={setSelectedMenu} />)} />
                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
        </Router>
  const renderPageContent = () => {
    switch(currentPage) {
      case '모의투자':
        return <InvestmentPage />;

      case '사용자디버그':
        return <UserDebugPage />;
      default:
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            color: 'var(--text-tertiary)',
            fontSize: '18px'
          }}>
            {currentPage} 페이지는 준비 중입니다.
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="app">
        <Sidebar
          currentPage={currentPage}
          onPageChange={handleNavigation}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />

        <div className="main-content">
          <Header
            currentPage={currentPage}
            onToggleSidebar={toggleSidebar}
          />

          <main className="content">
            {renderPageContent()}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
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
