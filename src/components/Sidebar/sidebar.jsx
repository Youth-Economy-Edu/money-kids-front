// src/components/Sidebar/sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    FaBars,
    FaLandmark,
    FaHome,
    FaGraduationCap,
    FaChartLine,
    FaUsers,
    FaChartPie,
    FaNewspaper
} from "react-icons/fa";
import "./sidebar.css";

const Sidebar = ({ onSelectMenu }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(window.innerWidth > 900);

    // 현재 경로에 따라 active 메뉴 설정
    const getActiveMenu = () => {
        const path = location.pathname;
        if (path === '/') return 'home';
        if (path === '/learn') return 'learn';
        if (path === '/investment') return 'investment';
        if (path.startsWith('/tendency')) return 'tendency'; // 성향분석 하위 페이지들도 포함
        if (path === '/news') return 'news';
        return 'home';
    };

    const [active, setActive] = useState(getActiveMenu());

    const toggleSidebar = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleResize = () => {
            setIsOpen(window.innerWidth > 900);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuItems = [
        { id: "home", icon: FaHome, label: "홈", path: "/" },
        { id: "learn", icon: FaGraduationCap, label: "경제 학습", path: "/learn" },
        { id: "investment", icon: FaChartLine, label: "모의 투자", path: "/investment" },
        { id: "tendency", icon: FaChartPie, label: "성향 분석", path: "/tendency" },
        { id: "news", icon: FaNewspaper, label: "경제 뉴스", path: "/news" }
    ];

    const handleMenuClick = (menuId, path) => {
        setActive(menuId);
        navigate(path);
        if (onSelectMenu) {
            onSelectMenu(menuId, path);
        }
    };

    // 경로 변경 시 active 메뉴 업데이트
    useEffect(() => {
        setActive(getActiveMenu());
    }, [location.pathname]);

    return (
        <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <FaLandmark className="logo-icon" />
                    {isOpen && <span className="logo-text">Money Kids</span>}
                </div>
                <button className="toggle-btn" onClick={toggleSidebar}>
                    <FaBars />
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <li key={item.id} className="nav-item">
                                <button
                                    className={`nav-link ${active === item.id ? "active" : ""}`}
                                    onClick={() => handleMenuClick(item.id, item.path)}
                                    title={item.label}
                                >
                                    <IconComponent className="nav-icon" />
                                    {isOpen && <span className="nav-text">{item.label}</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;
