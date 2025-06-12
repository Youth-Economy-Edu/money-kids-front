// src/App.jsx
import React, { useState } from "react";
import Sidebar from "./components/Sidebar/sidebar";
import Header from "./components/Header/header";
import "./App.css";

// 메뉴별 헤더 타이틀 정의
const headerTitles = {
    home: "안녕하세요, 김학생님! 👋",
    learn: "경제 공부를 시작해볼까요? 📘",
    invest: "모의 투자 거래 현황 📈",
    parent: "학부모 전용 안내 페이지 🧑‍🏫",
    analysis: "나의 투자 성향 분석 🧠",
    news: "오늘의 경제 뉴스 📰"
};

function App() {
    const [selectedMenu, setSelectedMenu] = useState("home");

    const handleMenuClick = (menuId) => {
        setSelectedMenu(menuId);
    };

    return (
        <div className="layout">
            <Sidebar onSelectMenu={handleMenuClick} />
            <div className="main-content">
                <Header title={selectedMenu ? headerTitles[selectedMenu] : ""} />
                <div className="content-area">
                    <p style={{ padding: "24px" }}>여기에 본문 내용이 들어갑니다.</p>
                </div>
            </div>
        </div>
    );
}

export default App;
