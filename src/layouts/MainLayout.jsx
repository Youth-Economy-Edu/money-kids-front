import React, { useState } from 'react';
import Header from '../components/Header/header';
import Sidebar from '../components/Sidebar/sidebar';
import './MainLayout.css';

const MainLayout = ({ children, title, levelText }) => {
    const [selectedMenu, setSelectedMenu] = useState('home');

    const handleMenuSelect = (menuId, path) => {
        setSelectedMenu(menuId);
        // 여기서 라우팅 로직을 추가할 수 있습니다
        console.log(`Selected menu: ${menuId}, path: ${path}`);
    };

    return (
        <div className="main-layout">
            <Sidebar onSelectMenu={handleMenuSelect} />
            <div className="main-content">
                <Header title={title} levelText={levelText} />
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
