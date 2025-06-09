import QuizResultPage from "./pages/QuizResultPage";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 📚 개념 학습 메인 페이지
import ConceptListPage from './pages/ConceptListPage';

// 🧠 퀴즈 난이도 선택 페이지
import QuizPage from './pages/QuizPage';

// ✅ OX 퀴즈 풀이 페이지
import QuizSolvePage from "./pages/QuizSolvePage.jsx";

// 🏁 퀴즈 결과 요약 페이지 (이제 ResultPage 하나로 통일)
import ResultPage from "./pages/ResultPage";

function App() {
    return (
        <Router>
            <Routes>
                {/* 📘 1. 메인 홈 - 경제 개념 리스트 */}
                <Route path="/" element={<ConceptListPage />} />

                {/* 🧩 2. 퀴즈 난이도 선택 화면 */}
                <Route path="/quiz" element={<QuizPage />} />

                {/* 🧠 3. 선택한 난이도 기반 OX 퀴즈 풀이 */}
                <Route path="/quiz/solve" element={<QuizSolvePage />} />

                {/* 🏁 4. 퀴즈 결과 요약 화면 (점수 및 메시지 + 홈 이동) */}
                <Route path="/quiz/result" element={<ResultPage />} />

                {/* 🔁 필요하면 추가 */}
                 <Route path="/quiz/start" element={<QuizSolvePage />} />
            </Routes>
        </Router>
    );
}

export default App;
