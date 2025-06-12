// src/components/Sidebar/sidebar.jsx
import React, { useState, useEffect } from "react";
import {
    FaBars,
    FaLandmark,
    FaHome,
    FaGraduationCap,
    FaChartLine,
    FaUsers,
    FaChartPie,
    FaNewspaper,
} from "react-icons/fa";
import "./sidebar.css";

const Sidebar = () => {
    const [active, setActive] = useState("home");
    const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    // 화면 크기 변경 감지하여 반응형 자동 처리
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setIsOpen(false);
            } else {
                setIsOpen(true);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuItems = [
        { id: "home", label: "홈", icon: <FaHome /> },
        { id: "learn", label: "경제배우기", icon: <FaGraduationCap />, badge: 3 },
        { id: "invest", label: "모의 투자", icon: <FaChartLine /> },
        { id: "parent", label: "학부모 페이지", icon: <FaUsers /> },
        { id: "analysis", label: "성향 분석", icon: <FaChartPie /> },
        { id: "news", label: "경제 소식", icon: <FaNewspaper />, badge: 5 },
    ];

    return (
        <>
            <button className="mobile-menu-toggle" onClick={toggleSidebar}>
                <FaBars />
            </button>
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="logo">
                    <FaLandmark className="logo-icon" />
                    <div>
                        <h1>경제 배우기</h1>
                        <p>스마트 금융 교육</p>
                    </div>
                </div>

                <div className="nav-menu">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            className={`nav-item ${active === item.id ? "active" : ""}`}
                            onClick={() => setActive(item.id)}
                        >
                            <div className="nav-icon">{item.icon}</div>
                            <div className="nav-text">{item.label}</div>
                            {item.badge && (
                                <div className="notification-badge">{item.badge}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
