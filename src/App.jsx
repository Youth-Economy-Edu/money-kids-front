import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './styles/components.css';

function App() {
  const [currentPage, setCurrentPage] = useState('홈');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderPageContent = () => {
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
