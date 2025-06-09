import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const QuizResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { score, total } = location.state || {};

    if (score === undefined) return <div>잘못된 접근입니다.</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-purple-50">
            <h1 className="text-3xl font-bold mb-4">퀴즈 결과</h1>
            <p className="text-xl mb-6">총 {total}문제 중 {score}문제를 맞췄어요!</p>
            <button
                onClick={() => navigate("/quiz")}
                className="bg-indigo-500 text-white px-6 py-3 rounded-xl text-lg"
            >
                다시 풀기
            </button>
        </div>
    );
};

export default QuizResultPage;
