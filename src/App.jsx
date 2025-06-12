// src/App.jsx
import React from "react";
import Sidebar from "./components/Sidebar/sidebar";
import Header from "./components/Header/header";
import "./App.css";

function App() {
    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="content-area">
                    {/* 여기에 페이지별 콘텐츠가 들어갈 수 있어요 */}
                    <p style={{ padding: "24px" }}>여기에 본문 내용이 들어갑니다.</p>
                </div>
            </div>
        </div>
    );
}

export default App;
