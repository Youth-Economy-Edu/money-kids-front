// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar/sidebar";
import Header from "./components/Header/header";
import Home from "./pages/Home/home.jsx";
import Login from "./pages/Login/login.jsx";
import Register from "./pages/Register/register.jsx";
import "./App.css";

export const ROUTES = {
    LOGIN: "/login",
    REGISTER: "/register",
    HOME: "/home",
};

const getHeaderTitle = (menuId, userName) => {
    switch (menuId) {
        case "home":
            return `안녕하세요, ${userName}님! 👋`;
        case "learn":
            return "경제 공부를 시작해볼까요? 📘";
        case "invest":
            return "모의 투자 거래 현황 📈";
        case "parent":
            return "학부모 전용 안내 페이지 🧑‍🏫";
        case "analysis":
            return "나의 투자 성향 분석 🧠";
        case "news":
            return "오늘의 경제 뉴스 📰";
        default:
            return "";
    }
};

function App() {
    const [selectedMenu, setSelectedMenu] = useState("home");
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("userId"));
    const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");

    const handleLogin = (username) => {
        setIsLoggedIn(true);
        setUserName(username);
        localStorage.setItem("userId", username);
        localStorage.setItem("userName", username);
    };

    const renderLayout = (content) => (
        <div className="layout">
            <Sidebar onSelectMenu={setSelectedMenu} />
            <div className="main-content">
                <Header title={getHeaderTitle(selectedMenu, userName)} />
                <div className="content-area">{content}</div>
            </div>
        </div>
    );

    return (
        <Router>
            <Routes>
                <Route path={ROUTES.LOGIN} element={<Login onLogin={handleLogin} />} />
                <Route path={ROUTES.REGISTER} element={<Register />} />
                <Route path={ROUTES.HOME} element={renderLayout(<Home onNavigate={setSelectedMenu} />)} />
                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
        </Router>
    );
}

export default App;
