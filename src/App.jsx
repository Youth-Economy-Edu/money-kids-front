import React from 'react';
import Sidebar from './components/Sidebar/sidebar';
import Header from './components/Header/header';
import ConceptListPage from './pages/Learn/ConceptListPage';
import QuizPage from './pages/Quiz/QuizPage';
import QuizSolvePage from './pages/Quiz/QuizSolvePage';
import ResultPage from './pages/Quiz/QuizResultPage'; // 여기를 수정 (QuizResultPage → ResultPage)
import './styles/components.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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
                            <Route path="/news" element={<PlaceholderPage title="경제 소식" />} />
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
