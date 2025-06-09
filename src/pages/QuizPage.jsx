import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ 퀴즈 난이도 선택 페이지 컴포넌트
const QuizPage = () => {
    const navigate = useNavigate(); // 페이지 이동을 위한 hook
    const [selectedLevel, setSelectedLevel] = useState(null); // 선택된 난이도 저장

    // 🔘 난이도 버튼 클릭 시 실행되는 함수
    const handleLevelSelect = (level) => {
        setSelectedLevel(level);
    };

    // ▶️ "퀴즈 시작하기" 버튼 클릭 시 실행되는 함수
    const handleStartQuiz = () => {
        if (selectedLevel) {
            // 선택된 난이도를 쿼리 파라미터로 전달하여 /quiz/start로 이동
            navigate(`/quiz/start?level=${selectedLevel}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50 px-4">
            {/* 페이지 제목 */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6">퀴즈 난이도 선택</h1>

            {/* 난이도 선택 버튼들 */}
            <div className="flex gap-4 mb-8">
                {[1, 2, 3, 4, 5].map((level) => (
                    <button
                        key={level}
                        onClick={() => handleLevelSelect(level)}
                        className={`px-4 py-2 rounded-xl border font-semibold transition
                            ${
                            selectedLevel === level
                                ? "bg-yellow-400 text-white border-yellow-500" // 선택된 버튼 스타일
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100" // 기본 버튼 스타일
                        }`}
                    >
                        난이도 {level}
                    </button>
                ))}
            </div>

            {/* 퀴즈 시작 버튼 */}
            <button
                onClick={handleStartQuiz}
                disabled={!selectedLevel} // 난이도 미선택 시 비활성화
                className={`px-6 py-3 rounded-2xl text-white font-bold text-lg transition 
                    ${
                    selectedLevel
                        ? "bg-green-500 hover:bg-green-600" // 활성화 상태
                        : "bg-gray-400 cursor-not-allowed"  // 비활성화 상태
                }`}
            >
                퀴즈 시작하기
            </button>
        </div>
    );
};

export default QuizPage;
