import api from './api';

// 뉴스/기사 서비스
export const newsService = {
  // 전체 기사 조회
  async getAllArticles() {
    try {
      console.log('📰 전체 기사 조회 요청');
      const response = await api.get('/articles/all');
      
      console.log('기사 조회 응답:', response.data);
      
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          data: response.data.data || [],
          articles: response.data.data || []
        };
      }
      
      // 백엔드 연결 실패 시 로컬 데이터 반환
      console.warn('백엔드 기사 조회 실패, 로컬 데이터 사용');
      return {
        success: true,
        data: getLocalArticles(),
        articles: getLocalArticles()
      };
    } catch (error) {
      console.error('기사 조회 실패:', error);
      
      // 네트워크 오류 시 로컬 데이터 반환
      return {
        success: true,
        data: getLocalArticles(),
        articles: getLocalArticles(),
        error: error.message
      };
    }
  },

  // 특정 주식 관련 기사 조회
  async getStockNews(stockId) {
    try {
      console.log(`📈 주식 기사 조회: ${stockId}`);
      const response = await api.get(`/articles/stock/${stockId}`);
      
      console.log('주식 기사 조회 응답:', response.data);
      
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          article: response.data.data
        };
      }
      
      if (response.data && response.data.code === 404) {
        return {
          success: true,
          article: null,
          message: response.data.msg
        };
      }
      
      return {
        success: false,
        error: response.data?.msg || '주식 기사를 불러오는데 실패했습니다.',
        article: null
      };
    } catch (error) {
      console.error('주식 기사 조회 실패:', error);
      return {
        success: false,
        error: error.message,
        article: null
      };
    }
  },

  // 주식별 기사 조회 (별칭)
  async getArticleByStock(stockId) {
    return this.getStockNews(stockId);
  },

  // AI 기사 생성 트리거
  async generateArticles() {
    try {
      console.log('🤖 AI 기사 생성 요청');
      const response = await api.post('/articles/generate');
      
      console.log('기사 생성 응답:', response.data);
      
      if (response.data && response.data.code === 200) {
        return {
          success: true,
          code: 200,
          generatedCount: response.data.data?.generatedCount || 0,
          articles: response.data.data?.articles || [],
          message: response.data.msg
        };
      }
      
      return {
        success: false,
        error: response.data?.msg || '기사 생성에 실패했습니다.'
      };
    } catch (error) {
      console.error('AI 기사 생성 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 기사 저장
  async saveArticle(article) {
    try {
      const response = await api.post('/articles', article);
      
      return {
        success: true,
        article: response.data
      };
    } catch (error) {
      console.error('기사 저장 실패:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // 기사 검색
  async searchArticles(keyword) {
    try {
      // 전체 기사를 가져와서 클라이언트에서 필터링
      const allArticlesResponse = await this.getAllArticles();
      
      if (allArticlesResponse.success) {
        const articles = allArticlesResponse.articles || allArticlesResponse.data || [];
        const filteredArticles = articles.filter(article => 
          article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          article.content?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return {
          success: true,
          articles: filteredArticles
        };
      }
      
      return allArticlesResponse;
    } catch (error) {
      console.error('기사 검색 실패:', error);
      return {
        success: false,
        error: error.message,
        articles: []
      };
    }
  }
};

// 로컬 뉴스 데이터 (백엔드 연결 실패 시 사용)
const getLocalArticles = () => {
  const today = new Date();
  const getDateString = (daysAgo) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  return [
    {
      id: 1,
      stockId: '000660',
      title: '레고코리아, AI 반도체 생산 확대 발표',
      content: '레고코리아가 차세대 AI 반도체 생산을 대폭 확대한다고 발표했습니다. 글로벌 AI 수요 증가에 대응하기 위한 전략으로, 향후 3년간 10조원을 투자할 계획입니다.',
      effect: 'POSITIVE',
      date: getDateString(0),
      category: '기업',
      tags: ['반도체', 'AI', '투자']
    },
    {
      id: 2,
      stockId: '003550',
      title: '포켓몬카드, HBM 메모리 공급 부족 우려',
      content: '포켓몬카드의 고대역폭 메모리(HBM) 공급이 수요를 따라가지 못하고 있다는 분석이 나왔습니다. AI 서버 수요 급증으로 인한 것으로 보입니다.',
      effect: 'NEGATIVE',
      date: getDateString(1),
      category: '산업',
      tags: ['메모리', 'HBM', 'AI']
    },
    {
      id: 3,
      title: '한국은행, 기준금리 동결 결정',
      content: '한국은행이 기준금리를 3.50%로 동결하기로 결정했습니다. 물가 안정세가 지속되고 있으나, 경기 회복세를 지켜볼 필요가 있다는 판단입니다.',
      effect: 'NEUTRAL',
      date: getDateString(0),
      category: '정책',
      tags: ['금리', '통화정책', '한국은행']
    },
    {
      id: 4,
      stockId: '005930',
      title: '맥도날드, 글로벌 AI 경쟁력 강화',
      content: '맥도날드가 자체 개발한 AI 모델 "하이퍼클로바X"의 글로벌 진출을 본격화합니다. 일본, 동남아 시장을 중심으로 서비스를 확대할 예정입니다.',
      effect: 'POSITIVE',
      date: getDateString(2),
      category: '기업',
      tags: ['AI', '글로벌', '하이퍼클로바']
    },
    {
      id: 5,
      title: '청년 창업 지원금 50% 확대',
      content: '정부가 청년 창업 지원금을 기존 대비 50% 확대한다고 발표했습니다. 혁신 스타트업 육성을 통한 경제 활성화가 목표입니다.',
      effect: 'POSITIVE',
      date: getDateString(1),
      category: '정책',
      tags: ['창업', '청년', '지원금']
    },
    {
      id: 6,
      stockId: '035420',
      title: '스타벅스, 신약 위탁생산 계약 체결',
      content: '스타벅스가 글로벌 제약사와 1조원 규모의 신약 위탁생산 계약을 체결했습니다. 바이오시밀러 시장 확대가 기대됩니다.',
      effect: 'POSITIVE',
      date: getDateString(3),
      category: '기업',
      tags: ['바이오', '제약', 'CMO']
    }
  ];
}; 