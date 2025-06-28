import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const programRef = useRef(null);

  // Intersection Observer 설정
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    const observerOptions = {
      threshold: 0.2
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 각 섹션 관찰 시작
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (statsRef.current) observer.observe(statsRef.current);
    if (programRef.current) observer.observe(programRef.current);

    return () => observer.disconnect();
  }, []);

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 부드러운 스크롤 이동
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: "📚",
      title: "체계적인 경제 교육",
      description: "기초부터 고급까지 단계별 경제 학습 프로그램"
    },
    {
      icon: "🏆",
      title: "게임화된 퀴즈",
      description: "재미있는 퀴즈로 학습 효과를 극대화"
    },
    {
      icon: "💼",
      title: "실전 모의투자",
      description: "가상 자금으로 실제 투자 환경을 경험"
    },
    {
      icon: "📊",
      title: "투자 성향 분석",
      description: "개인 맞춤형 투자 성향 진단 서비스"
    },
    {
      icon: "📰",
      title: "실시간 경제 뉴스",
      description: "최신 경제 동향과 투자 정보 제공"
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "학부모 모니터링",
      description: "자녀의 학습 진도와 성향을 실시간 확인"
    }
  ];

  const statistics = [
    { number: "10,000+", label: "누적 사용자" },
    { number: "50,000+", label: "완료된 학습" },
    { number: "95%", label: "만족도" },
    { number: "24/7", label: "서비스 운영" }
  ];

  return (
    <div className="landing-page">
      {/* 헤더 */}
      <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>💰 머니키즈</h1>
              <span className="tagline">청소년 경제교육 플랫폼</span>
            </div>
            <nav className="header-nav">
              <a href="#features" onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}>서비스 소개</a>
              <a href="#about" onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}>프로그램 안내</a>
              <button 
                className="login-btn"
                onClick={() => navigate('/login')}
              >
                로그인
              </button>
              <button 
                className="register-btn"
                onClick={() => navigate('/register')}
              >
                회원가입
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 히어로 섹션 */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>청소년 경제교육의 새로운 시작</h1>
              <p>체계적인 금융 교육으로 자녀의 미래를 준비하세요</p>
              <div className="hero-buttons">
                <button 
                  className="cta-primary"
                  onClick={() => navigate('/register')}
                >
                  무료로 시작하기
                </button>
                <button 
                  className="cta-secondary"
                  onClick={() => navigate('/login')}
                >
                  기존 회원 로그인
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-icon">💰</div>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section ref={statsRef} className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {statistics.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section ref={featuresRef} id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>📋 주요 서비스</h2>
            <p>체계적이고 안전한 청소년 경제교육 프로그램을 제공합니다</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 프로그램 안내 섹션 */}
      <section ref={programRef} id="about" className="program-section">
        <div className="container">
          <div className="section-header">
            <h2>🎓 교육 프로그램</h2>
            <p>단계별 체계적인 경제교육으로 실전 능력을 키워보세요</p>
          </div>
          <div className="program-content">
            <div className="program-steps">
              <div className="step">
                <div className="step-number">01</div>
                <h3>기초 경제 개념 학습</h3>
                <p>화폐, 시장, 경제 원리 등 기본 개념부터 차근차근</p>
              </div>
              <div className="step">
                <div className="step-number">02</div>
                <h3>실전 퀴즈와 게임</h3>
                <p>학습한 내용을 재미있는 퀴즈로 복습하고 경쟁</p>
              </div>
              <div className="step">
                <div className="step-number">03</div>
                <h3>모의투자 체험</h3>
                <p>가상 자금으로 실제 주식 시장 환경에서 투자 연습</p>
              </div>
              <div className="step">
                <div className="step-number">04</div>
                <h3>성향 분석 및 피드백</h3>
                <p>AI 기반 성향 분석으로 개인 맞춤형 조언 제공</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 콜투액션 섹션 */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>지금 바로 시작하세요</h2>
            <p>머니키즈와 함께라면 경제 전문가가 되는 길, 어렵지 않습니다.</p>
            <button className="cta-final" onClick={() => navigate('/register')}>
              무료 회원가입
            </button>
          </div>
        </div>
      </section>
      
      {/* 푸터 */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-bottom">
            <p>&copy; 2025 Money Kids. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
};

export default LandingPage; 