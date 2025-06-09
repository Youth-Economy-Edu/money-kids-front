import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios"; // 백엔드에서 퀴즈 불러올 때 사용

const QuizSolvePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const level = searchParams.get("level");
    const [quizzes, setQuizzes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);

    useEffect(() => {
        // 🔁 퀴즈 데이터 백엔드에서 가져오기
        axios.get(`/api/quiz?level=${level}`)
            .then((res) => {
                setQuizzes(res.data); // 퀴즈 배열 저장
            })
            .catch((err) => {
                console.error("퀴즈 불러오기 실패", err);
            });
    }, [level]);

    const handleAnswer = (answer) => {
        const currentQuiz = quizzes[currentIndex];
        const isCorrect = currentQuiz.correctAnswer === answer;
        if (isCorrect) setScore(score + 1);

        if (currentIndex + 1 < quizzes.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // 결과 페이지로 이동하면서 점수 전달
            navigate(`/quiz/result`, {
                state: { total: quizzes.length, score }
            });
        }
    };

    if (quizzes.length === 0) return <div>퀴즈 로딩 중...</div>;

    if (!quizzes || quizzes.length === 0) {
        return <div>퀴즈 로딩 중...</div>;
    }

    const currentQuiz = quizzes[currentIndex];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-blue-50">
            <h2 className="text-xl font-semibold mb-4">문제 {currentIndex + 1}/{quizzes.length}</h2>
            <div className="bg-white p-6 rounded-xl shadow-md text-center mb-6 w-full max-w-xl">
                <p className="text-lg font-bold mb-4">{currentQuiz.question}</p>
                <div className="flex justify-center gap-8">
                    <button
                        onClick={() => handleAnswer("O")}
                        className="bg-green-400 hover:bg-green-500 text-white px-6 py-3 rounded-xl text-lg font-semibold"
                    >
                        O
                    </button>
                    <button
                        onClick={() => handleAnswer("X")}
                        className="bg-red-400 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-lg font-semibold"
                    >
                        X
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizSolvePage;
