import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InvestmentPage from './pages/InvestmentPage';
import './styles/components.css';

function App() {
  // 기본 페이지를 '모의 투자'로 설정
  const [currentPage, setCurrentPage] = useState('모의투자');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderPageContent = () => {
    switch(currentPage) {
      case '모의투자':
        return <InvestmentPage />;
      default:
        return (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '60vh',
            color: 'var(--text-tertiary)',
            fontSize: '18px'
          }}>
            {currentPage} 페이지는 준비 중입니다.
          </div>
        );
    }
  };

  return (
    <div className="app">
      <Sidebar 
        currentPage={currentPage}
        onPageChange={handleNavigation}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      
      <div className="main-content">
        <Header 
          currentPage={currentPage}
          onToggleSidebar={toggleSidebar}
        />
        
        <main className="content">
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
