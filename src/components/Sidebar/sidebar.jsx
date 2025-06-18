import React, { useState, useEffect } from "react";
import {
    FaBars, FaLandmark, FaHome, FaGraduationCap, FaChartLine, FaUsers, FaChartPie, FaNewspaper
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "./sidebar.css";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(window.innerWidth > 900);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => setIsOpen(window.innerWidth > 900);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const menuItems = [
        { id: "/", label: "홈", icon: <FaHome /> },
        { id: "/learn", label: "경제배우기", icon: <FaGraduationCap /> },
        { id: "/invest", label: "모의 투자", icon: <FaChartLine /> },
        { id: "/parent", label: "학부모 페이지", icon: <FaUsers /> },
        { id: "/analysis", label: "성향 분석", icon: <FaChartPie /> },
        { id: "/news", label: "경제 소식", icon: <FaNewspaper /> }
    ];

    return (
        <>
            <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
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
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            className={`nav-item ${location.pathname === item.id ? "active" : ""}`}
                            onClick={() => navigate(item.id)}>
                            <div className="nav-icon">{item.icon}</div>
                            <div className="nav-text">{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
