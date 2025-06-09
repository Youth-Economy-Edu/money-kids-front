// src/pages/ResultPage.jsx

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResultPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    // ✅ 쿼리에서 점수 데이터 가져오기
    const score = parseInt(query.get("score"), 10);
    const total = parseInt(query.get("total"), 10);
    const percentage = Math.round((score / total) * 100);

    // ✅ 점수에 따른 메시지 출력
    const getMessage = () => {
        if (percentage === 100) return "완벽해요! 정말 잘했어요 👏";
        if (percentage >= 80) return "훌륭해요! 거의 다 맞췄어요!";
        if (percentage >= 50) return "좋아요! 조금만 더 연습해봐요!";
        return "조금 더 공부가 필요해요. 화이팅!";
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4 text-center">
            <h1 className="text-3xl font-bold mb-6">퀴즈 결과</h1>
            <div className="bg-white shadow-md rounded-2xl p-8 mb-6 max-w-md w-full">
                <p className="text-xl font-semibold mb-2">총 점수: {score} / {total}</p>
                <p className="text-lg text-gray-600">{getMessage()}</p>
            </div>

            {/* 홈으로 돌아가기 버튼 */}
            <button
                onClick={() => navigate("/")}
                className="mt-4 px-6 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition"
            >
                홈으로 가기
            </button>
        </div>
    );
};

export default ResultPage;
