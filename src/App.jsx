import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar/sidebar';
import Header from './components/Header/header';
import ServerStatus from './components/ServerStatus';
import ConceptListPage from './pages/Learn/ConceptListPage';
import QuizPage from './pages/Quiz/QuizPage';
import QuizSolvePage from './pages/Quiz/QuizSolvePage';
import ResultPage from './pages/Quiz/QuizResultPage';
import AnalysisPage from './pages/AnalysisPage';
import InvestmentPage from './pages/InvestmentPage';
import StockDetailPage from './pages/StockDetailPage';
import NewsPage from './pages/NewsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import './styles/components.css';

// 앱 내부 컴포넌트 (AuthProvider 내부에서 실행)
function AppContent() {
    const { user, loading, isAuthenticated, logout } = useAuth();

    if (loading) {
        return (
            <div className="app-loading">
                <div className="loading-spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return (
            <>
                <ServerStatus />
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </>
        );
    }

    return (
        <div className="app">
            <ServerStatus />
            <Sidebar />
            <div className="main-content">
                <Header currentUser={user} onLogout={logout} />
                <main className="content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/dashboard" element={<HomePage />} />
                        <Route path="/learn" element={<ConceptListPage />} />
                        <Route path="/quiz" element={<QuizPage />} />
                        <Route path="/quiz/solve" element={<QuizSolvePage />} />
                        <Route path="/quiz/result" element={<ResultPage />} />
                        <Route path="/invest" element={<InvestmentPage />} />
                        <Route path="/stock/:stockCode" element={<StockDetailPage />} />
                        <Route path="/analysis" element={<AnalysisPage />} />
                        <Route path="/news" element={<NewsPage />} />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/signup" element={<Navigate to="/" replace />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

// 메인 App 컴포넌트
function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
