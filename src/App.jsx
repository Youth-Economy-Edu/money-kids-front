import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './styles/components.css';
import './App.css';

// 📘 경제 개념 학습 페이지
import ConceptListPage from './pages/Learn/ConceptListPage';

// 🧠 퀴즈 관련 페이지
import QuizPage from './pages/Quiz/QuizPage';
import QuizSolvePage from './pages/Quiz/QuizSolvePage';
import QuizResultPage from './pages/Quiz/QuizResultPage';

function App() {
    const [currentPage, setCurrentPage] = useState('홈');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleNavigation = (page) => {
        setCurrentPage(page);
        setSidebarOpen(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Router>
            <div className="layout">
                <Sidebar
                    currentPage={currentPage}
                    onPageChange={handleNavigation}
                    isOpen={sidebarOpen}
                    onToggle={toggleSidebar}
                />

                <div className="main-content">
                    <Header currentPage={currentPage} onToggleSidebar={toggleSidebar} />

                    <main className="content-area">
                        <Routes>
                            <Route path="/" element={<ConceptListPage />} />
                            <Route path="/quiz" element={<QuizPage />} />
                            <Route path="/quiz/solve" element={<QuizSolvePage />} />
                            <Route path="/quiz/result" element={<QuizResultPage />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
