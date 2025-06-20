import { worksheetApi } from './apiService.js';

// 난이도별 색상 매핑
const difficultyColors = {
  1: 'basic',    // 기초 - 녹색
  2: 'beginner', // 초급 - 파랑
  3: 'intermediate', // 중급 - 주황
  4: 'advanced', // 고급 - 빨강
  5: 'expert'    // 전문가 - 보라
};

// 난이도별 이름 매핑
const difficultyNames = {
  1: '기초',
  2: '초급', 
  3: '중급',
  4: '고급',
  5: '전문가'
};

// 아이콘 매핑 (임시 데이터)
const iconMapping = {
  '저축': '💰',
  '투자': '📈',
  '소비': '🛒',
  '경제': '🏛️',
  '금융': '🏦',
  '화폐': '💵',
  '보험': '🛡️',
  '예산': '📊',
  '신용': '💳',
  '부채': '📋'
};

// 학습 개념 서비스
export const conceptService = {
  // 난이도별 학습 개념 목록 조회
  getConceptsByDifficulty: async (difficulty) => {
    try {
      const response = await worksheetApi.getByDifficulty(difficulty);
      return {
        success: true,
        data: response.ids || []
      };
    } catch (error) {
      console.error('난이도별 개념 조회 실패:', error);
      return {
        success: false,
        error: error.message || '개념 조회에 실패했습니다.',
        data: []
      };
    }
  },

  // 개념 상세 정보 조회
  async getConceptDetail(id) {
    try {
      const result = await worksheetApi.getConceptDetail(id);
      if (result.success && result.data) {
        // 상세 정보에 추가 메타데이터 포함
        const conceptDetail = {
          ...result.data,
          icon: this.getIconForConcept(result.data.title || result.data.name),
          estimatedTime: this.getEstimatedTime(result.data.content),
          studentCount: Math.floor(Math.random() * 1000) + 100, // 임시 학습자 수
          rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0 평점
          features: this.extractFeatures(result.data.content), // 내용 기반 특징 추출
          objectives: this.extractObjectives(result.data.content) // 학습 목표 추출
        };
        
        return {
          success: true,
          data: conceptDetail
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('개념 상세 조회 실패:', error);
      return {
        success: false,
        error: '개념 상세 정보를 불러오는 중 오류가 발생했습니다.',
        data: null
      };
    }
  },

  // 난이도별 통계 정보 조회
  async getDifficultyStats() {
    try {
      const stats = [];
      for (let level = 1; level <= 5; level++) {
        const result = await worksheetApi.getConceptsByDifficulty(level);
        if (result.success) {
          stats.push({
            level,
            name: difficultyNames[level],
            color: difficultyColors[level],
            count: result.data.length,
            completedCount: Math.floor(result.data.length * Math.random() * 0.8), // 임시 완료 수
            progress: Math.floor(Math.random() * 100) // 임시 진행률
          });
        }
      }
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('난이도별 통계 조회 실패:', error);
      return {
        success: false,
        error: '통계 정보를 불러오는 중 오류가 발생했습니다.',
        data: []
      };
    }
  },

  // 학습 진행률 계산 (임시 구현)
  async getOverallProgress(userId = 'default') {
    try {
      // 전체 개념 수와 완료된 개념 수를 기반으로 계산
      const allConcepts = await this.getConceptsByDifficulty(0);
      if (allConcepts.success) {
        const totalCount = allConcepts.data.length;
        const completedCount = allConcepts.data.filter(concept => concept.isCompleted).length;
        const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        return {
          success: true,
          data: {
            totalConcepts: totalCount,
            completedConcepts: completedCount,
            progressPercentage,
            streakDays: Math.floor(Math.random() * 14) + 1, // 임시 연속 학습일
            totalStudyTime: Math.floor(Math.random() * 120) + 30 // 임시 총 학습시간(분)
          }
        };
      } else {
        return allConcepts;
      }
    } catch (error) {
      console.error('학습 진행률 계산 실패:', error);
      return {
        success: false,
        error: '학습 진행률을 계산하는 중 오류가 발생했습니다.',
        data: null
      };
    }
  },

  // 유틸리티 메서드들
  getIconForConcept(title = '') {
    // 제목에서 키워드를 찾아 아이콘 반환
    for (const [keyword, icon] of Object.entries(iconMapping)) {
      if (title.includes(keyword)) {
        return icon;
      }
    }
    return '📚'; // 기본 아이콘
  },

  getEstimatedTime(content = '') {
    // 내용 길이에 따른 예상 소요시간 계산
    const length = content.length;
    if (length < 500) return '5-10분';
    if (length < 1000) return '10-15분';
    if (length < 2000) return '15-25분';
    return '25-35분';
  },

  extractFeatures(content = '') {
    // 내용을 분석하여 특징 추출 (임시 구현)
    const features = [];
    
    if (content.includes('그래프') || content.includes('차트') || content.includes('도표')) {
      features.push({ icon: '📊', text: '시각적 자료' });
    }
    if (content.includes('동영상') || content.includes('영상')) {
      features.push({ icon: '🎥', text: '동영상 강의' });
    }
    if (content.includes('실습') || content.includes('연습') || content.includes('실전')) {
      features.push({ icon: '💡', text: '실습 중심' });
    }
    if (content.includes('토론') || content.includes('질문') || content.includes('의견')) {
      features.push({ icon: '💬', text: '토론 활동' });
    }
    
    // 기본 특징들 추가
    if (features.length < 2) {
      features.push(
        { icon: '📚', text: '이론 학습' },
        { icon: '✅', text: '퀴즈 포함' }
      );
    }
    
    return features.slice(0, 4); // 최대 4개까지
  },

  extractObjectives(content = '') {
    // 학습 목표 추출 (임시 구현)
    const objectives = [
      '기본 개념과 원리를 이해할 수 있습니다',
      '실생활 적용 방법을 학습할 수 있습니다',
      '관련 용어와 개념을 설명할 수 있습니다'
    ];
    
    // 내용에 따라 추가 목표 생성
    if (content.includes('계산') || content.includes('공식')) {
      objectives.push('관련 계산 방법을 익힐 수 있습니다');
    }
    if (content.includes('분석') || content.includes('평가')) {
      objectives.push('상황을 분석하고 판단할 수 있습니다');
    }
    
    return objectives.slice(0, 4); // 최대 4개까지
  },

  // 검색 기능
  async searchConcepts(keyword, difficulty = 0) {
    try {
      const allConcepts = await this.getConceptsByDifficulty(difficulty);
      if (allConcepts.success) {
        const filteredConcepts = allConcepts.data.filter(concept => 
          (concept.title || concept.name || '').toLowerCase().includes(keyword.toLowerCase()) ||
          (concept.description || concept.content || '').toLowerCase().includes(keyword.toLowerCase())
        );
        
        return {
          success: true,
          data: filteredConcepts
        };
      } else {
        return allConcepts;
      }
    } catch (error) {
      console.error('개념 검색 실패:', error);
      return {
        success: false,
        error: '검색 중 오류가 발생했습니다.',
        data: []
      };
    }
  }
};

export default conceptService; 