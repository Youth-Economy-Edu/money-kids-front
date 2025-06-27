import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Sidebar from './components/Sidebar/sidebar';
import Header from './components/Header/header';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login/login';
import Register from './pages/Register/register';
import LoginSuccessPage from './pages/LoginSuccessPage';
import Home from './pages/Home/home';
import ConceptListPage from './pages/Learn/ConceptListPage';
import QuizPage from './pages/Quiz/QuizPage';
import QuizSolvePage from './pages/Quiz/QuizSolvePage';
import ResultPage from './pages/Quiz/QuizResultPage';
import NewsPage from './pages/NewsPage';
import InvestmentPage from './pages/InvestmentPage';
import UserDebugPage from './pages/UserDebugPage';
import TendencyAnalysis from './pages/TendencyAnalysis/TendencyAnalysis';
import TendencyDetail from './pages/TendencyAnalysis/TendencyDetail';
import InvestmentPortfolio from './pages/TendencyAnalysis/InvestmentPortfolio';
import ActivityMonitoring from './pages/TendencyAnalysis/ActivityMonitoring';
import Recommendations from './pages/TendencyAnalysis/Recommendations';
import './styles/components.css';
import './App.css';

// 라우트 경로 상수
export const ROUTES = {
    LANDING: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    LOGIN_SUCCESS: '/login-success',
    HOME: '/home',
    LEARN: '/learn',
    QUIZ: '/quiz',
    INVEST: '/invest',
    PARENT: '/parent',
    ANALYSIS: '/analysis',
    NEWS: '/news'
};

const getHeaderTitle = (page) => {
    switch(page) {
        case '홈':
            return '안녕하세요! 👋';
        case '경제배우기':
            return '경제 공부를 시작해볼까요? 📚';
        case '모의투자':
            return '모의 투자로 경험을 쌓아보세요 📈';
        case '학부모페이지':
            return '학부모 전용 페이지 👨‍👩‍👧‍👦';
        case '성향분석':
            return '나의 투자 성향을 알아보세요 🎯';
        case '경제뉴스':
            return '오늘의 경제 소식 📰';
        default:
            return '머니키즈 💰';
    }
};

// 인증이 필요한 레이아웃 컴포넌트
const ProtectedLayout = ({ children, currentPageName }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const [currentPage, setCurrentPage] = useState(currentPageName || '홈');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && (!isAuthenticated() || !user)) {
            console.log('인증되지 않은 접근 차단, 로그인 페이지로 리다이렉트');
            navigate(ROUTES.LOGIN, { replace: true });
        }
    }, [loading, isAuthenticated, user, navigate]);

    useEffect(() => {
        if (currentPageName) {
            setCurrentPage(currentPageName);
        }
    }, [currentPageName]);

    const handleNavigation = (page) => {
        setCurrentPage(page);
        setSidebarOpen(false);
        
        const pageRoutes = {
            '홈': ROUTES.HOME,
            '경제배우기': ROUTES.LEARN,
            '모의투자': ROUTES.INVEST,
            '학부모페이지': ROUTES.PARENT,
            '성향분석': ROUTES.ANALYSIS,
            '경제뉴스': ROUTES.NEWS,
            'learn': ROUTES.LEARN,
            'invest': ROUTES.INVEST,
            'news': ROUTES.NEWS,
            'home': ROUTES.HOME
        };
        
        const route = pageRoutes[page];
        if (route) {
            navigate(route);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (loading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (!isAuthenticated() || !user) {
        return null;
    }

    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { onNavigate: handleNavigation });
        }
        return child;
    });

    return (
        <div className="app">
            <Sidebar
                currentPage={currentPage}
                onPageChange={handleNavigation}
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
            />
            <div className="main-content">
                <Header
                    title={getHeaderTitle(currentPage)}
                    onToggleSidebar={toggleSidebar}
                />
                <main className="content">
                    {childrenWithProps}
                </main>
            </div>
        </div>
    );
};

const AppContent = () => {
    const { login } = useAuth();

    const handleLogin = (userData) => {
        if (typeof userData === 'string') {
            const userInfo = {
                id: userData,
                name: userData,
                isAuthenticated: true
            };
            login(userInfo);
        } else {
            const userInfo = {
                id: userData.id,
                name: userData.name || userData.id,
                points: userData.points || 0,
                tendency: userData.tendency || '',
                isAuthenticated: true,
                ...userData
            };
            login(userInfo);
        }
    };

    return (
        <Routes>
            {/* 퍼블릭 라우트 */}
            <Route path={ROUTES.LANDING} element={<LandingPage />} />
            <Route path={ROUTES.LOGIN} element={<Login onLogin={handleLogin} />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path={ROUTES.LOGIN_SUCCESS} element={<LoginSuccessPage />} />
            
            {/* 인증이 필요한 라우트 */}
            <Route path={ROUTES.HOME} element={
                <ProtectedLayout currentPageName="홈">
                    <Home />
                </ProtectedLayout>
            } />
            <Route path={ROUTES.LEARN} element={
                <ProtectedLayout currentPageName="경제배우기">
                    <ConceptListPage />
                </ProtectedLayout>
            } />
            <Route path={`${ROUTES.QUIZ}/*`} element={
                <ProtectedLayout currentPageName="경제배우기">
                    <Routes>
                        <Route index element={<QuizPage />} />
                        <Route path="solve" element={<QuizSolvePage />} />
                        <Route path="result" element={<ResultPage />} />
                    </Routes>
                </ProtectedLayout>
            } />
            <Route path={ROUTES.INVEST} element={
                <ProtectedLayout currentPageName="모의투자">
                    <InvestmentPage />
                </ProtectedLayout>
            } />
            <Route path={ROUTES.NEWS} element={
                <ProtectedLayout currentPageName="경제뉴스">
                    <NewsPage />
                </ProtectedLayout>
            } />
            <Route path={ROUTES.ANALYSIS} element={
                <ProtectedLayout currentPageName="성향분석">
                    <TendencyAnalysis />
                </ProtectedLayout>
            } />
            <Route path={`${ROUTES.ANALYSIS}/detail`} element={
                <ProtectedLayout currentPageName="성향분석">
                    <TendencyDetail />
                </ProtectedLayout>
            } />
            <Route path={`${ROUTES.ANALYSIS}/portfolio`} element={
                <ProtectedLayout currentPageName="성향분석">
                    <InvestmentPortfolio />
                </ProtectedLayout>
            } />
            <Route path={`${ROUTES.ANALYSIS}/activity`} element={
                <ProtectedLayout currentPageName="성향분석">
                    <ActivityMonitoring />
                </ProtectedLayout>
            } />
            <Route path={`${ROUTES.ANALYSIS}/recommendations`} element={
                <ProtectedLayout currentPageName="성향분석">
                    <Recommendations />
                </ProtectedLayout>
            } />
            <Route path="/debug" element={<UserDebugPage />} />
            
            {/* 기본 리다이렉트 */}
            <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
        </Routes>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <AppContent />
                </NotificationProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;
