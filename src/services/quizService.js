import { quizApi } from './apiService.js';

// 난이도별 설정
const difficultyConfig = {
  '기초': {
    level: 'basic',
    color: '#4ade80',
    problems: 10,
    timeLimit: '10분',
    pointsPerQuestion: 10
  },
  '초급': {
    level: 'beginner', 
    color: '#60a5fa',
    problems: 15,
    timeLimit: '15분',
    pointsPerQuestion: 15
  },
  '중급': {
    level: 'intermediate',
    color: '#f59e0b', 
    problems: 20,
    timeLimit: '20분',
    pointsPerQuestion: 20
  },
  '고급': {
    level: 'advanced',
    color: '#ef4444',
    problems: 25,
    timeLimit: '25분',
    pointsPerQuestion: 25
  },
  '전문가': {
    level: 'expert',
    color: '#8b5cf6',
    problems: 30,
    timeLimit: '30분',
    pointsPerQuestion: 30
  }
};

// 퀴즈 서비스
export const quizService = {
  // 난이도별 퀴즈 정보 조회
  async getQuizInfoByDifficulty() {
    try {
      const quizInfo = Object.entries(difficultyConfig).map(([name, config]) => ({
        name,
        ...config,
        description: `${name} 수준의 경제 퀴즈입니다`,
        icon: this.getDifficultyIcon(name)
      }));

      return {
        success: true,
        data: quizInfo
      };
    } catch (error) {
      console.error('퀴즈 정보 조회 실패:', error);
      return {
        success: false,
        error: '퀴즈 정보를 불러오는 중 오류가 발생했습니다.',
        data: []
      };
    }
  },

  // 난이도별 랜덤 퀴즈 조회
  getRandomQuizzes: async (level) => {
    try {
      const response = await quizApi.getRandomQuizzes(level);
      if (response.code === 200) {
        return {
          success: true,
          quizzes: response.data || []
        };
      } else {
        return {
          success: false,
          error: response.msg || '퀴즈를 불러올 수 없습니다.',
          quizzes: []
        };
      }
    } catch (error) {
      console.error('퀴즈 조회 실패:', error);
      return {
        success: false,
        error: error.message || '퀴즈 조회에 실패했습니다.',
        quizzes: []
      };
    }
  },

  // 퀴즈 제출
  submitQuiz: async (quizData) => {
    try {
      const response = await quizApi.submitQuiz(quizData);
      if (response.code === 200) {
        return {
          success: true,
          data: response.data,
          points: response.data.points || 0
        };
      } else {
        return {
          success: false,
          error: response.msg || '퀴즈 제출에 실패했습니다.'
        };
      }
    } catch (error) {
      console.error('퀴즈 제출 실패:', error);
      return {
        success: false,
        error: error.message || '퀴즈 제출에 실패했습니다.'
      };
    }
  },

  // 퀴즈 결과 조회
  getQuizResults: async (userId) => {
    try {
      const response = await quizApi.getQuizResults(userId);
      if (response.code === 200) {
        return {
          success: true,
          data: response.data || []
        };
      } else {
        return {
          success: false,
          error: response.msg || '퀴즈 결과를 불러올 수 없습니다.',
          data: []
        };
      }
    } catch (error) {
      console.error('퀴즈 결과 조회 실패:', error);
      return {
        success: false,
        error: error.message || '퀴즈 결과 조회에 실패했습니다.',
        data: []
      };
    }
  },

  // 퀴즈 통계 계산
  calculateQuizStats(results) {
    if (!results || results.length === 0) {
      return {
        totalQuizzes: 0,
        correctAnswers: 0,
        accuracy: 0,
        totalPoints: 0,
        averageScore: 0,
        bestStreak: 0,
        rankPosition: 0
      };
    }

    const totalQuizzes = results.length;
    const correctAnswers = results.filter(r => r.correct === true || r.isCorrect === true).length;
    const accuracy = totalQuizzes > 0 ? Math.round((correctAnswers / totalQuizzes) * 100) : 0;
    const totalPoints = results.reduce((sum, r) => sum + (r.points || 0), 0);
    const averageScore = totalQuizzes > 0 ? Math.round(totalPoints / totalQuizzes) : 0;

    return {
      totalQuizzes,
      correctAnswers,
      accuracy,
      totalPoints,
      averageScore,
      bestStreak: Math.floor(Math.random() * 10) + 5, // 임시 최고 연속 정답
      rankPosition: Math.floor(Math.random() * 100) + 1 // 임시 순위
    };
  },

  // 더미 퀴즈 데이터 생성
  generateDummyQuizStats() {
    return {
      totalQuizzes: 45,
      correctAnswers: 32,
      accuracy: 71,
      totalPoints: 1280,
      averageScore: 28,
      bestStreak: 8,
      rankPosition: 42
    };
  },

  // 더미 일일 도전 데이터 생성
  generateDummyDailyChallenge() {
    return {
      dailyGoal: 5,
      completed: 3,
      remaining: 2,
      streak: 7,
      reward: 50,
      nextReward: 75
    };
  },

  // 일일 퀴즈 도전 정보
  async getDailyChallengeInfo(userId = 'guest') {
    try {
      // 더미 데이터 사용 (실제 API 구현 시 수정)
      return {
        success: true,
        data: this.generateDummyDailyChallenge()
      };
    } catch (error) {
      console.error('일일 도전 정보 조회 실패:', error);
      return {
        success: false,
        error: '일일 도전 정보를 불러오는 중 오류가 발생했습니다.',
        data: this.generateDummyDailyChallenge()
      };
    }
  },

  // 오답 노트 조회 (임시 구현)
  async getWrongAnswers(userId) {
    try {
      const results = await this.getQuizResults(userId);
      
      if (results.success) {
        const wrongAnswers = results.data.filter(quiz => 
          quiz.correct === false || quiz.isCorrect === false
        );

        return {
          success: true,
          data: wrongAnswers.map(quiz => ({
            ...quiz,
            reviewCount: Math.floor(Math.random() * 3), // 임시 복습 횟수
            lastReviewAt: null,
            isReviewed: false
          }))
        };
      } else {
        return results;
      }
    } catch (error) {
      console.error('오답 노트 조회 실패:', error);
      return {
        success: false,
        error: '오답 노트를 불러오는 중 오류가 발생했습니다.',
        data: []
      };
    }
  },

  // 퀴즈 카테고리별 성과 분석
  async getCategoryPerformance(userId) {
    try {
      const results = await this.getQuizResults(userId);
      
      if (results.success) {
        const categories = ['저축', '투자', '소비', '금융', '경제'];
        const performance = categories.map(category => {
          const categoryQuizzes = results.data.filter(quiz => 
            (quiz.category || quiz.topic || '').includes(category)
          );
          
          const total = categoryQuizzes.length;
          const correct = categoryQuizzes.filter(q => q.correct || q.isCorrect).length;
          
          return {
            category,
            total,
            correct,
            accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
            level: this.getPerformanceLevel(total > 0 ? (correct / total) * 100 : 0)
          };
        });

        return {
          success: true,
          data: performance
        };
      } else {
        return results;
      }
    } catch (error) {
      console.error('카테고리별 성과 분석 실패:', error);
      return {
        success: false,
        error: '성과 분석을 불러오는 중 오류가 발생했습니다.',
        data: []
      };
    }
  },

  // 유틸리티 메서드들
  getDifficultyIcon(difficulty) {
    const icons = {
      '기초': '🌱',
      '초급': '📘', 
      '중급': '📙',
      '고급': '📕',
      '전문가': '🏆'
    };
    return icons[difficulty] || '📚';
  },

  getLevelName(level) {
    const levelNames = {
      'basic': '기초',
      'beginner': '초급',
      'intermediate': '중급', 
      'advanced': '고급',
      'expert': '전문가'
    };
    return levelNames[level] || level;
  },

  getLevelColor(level) {
    const levelColors = {
      'basic': '#4ade80',
      'beginner': '#60a5fa',
      'intermediate': '#f59e0b',
      'advanced': '#ef4444', 
      'expert': '#8b5cf6'
    };
    return levelColors[level] || '#6b7280';
  },

  calculateDailyReward(completedCount) {
    if (completedCount >= 5) return 100; // 목표 달성 보너스
    return completedCount * 15; // 문제당 15포인트
  },

  getPerformanceLevel(accuracy) {
    if (accuracy >= 90) return '우수';
    if (accuracy >= 70) return '양호';
    if (accuracy >= 50) return '보통';
    return '향상필요';
  },

  // 랜덤 퀴즈 추천
  async getRecommendedQuizzes(userId) {
    try {
      // 사용자의 약한 분야를 기반으로 추천 (임시 구현)
      const performance = await this.getCategoryPerformance(userId);
      
      if (performance.success) {
        const weakCategories = performance.data
          .filter(cat => cat.accuracy < 70)
          .sort((a, b) => a.accuracy - b.accuracy);
        
        const recommendedLevel = weakCategories.length > 0 ? '기초' : '중급';
        
        return await this.getRandomQuizzes(recommendedLevel);
      } else {
        // 기본 추천: 기초 레벨
        return await this.getRandomQuizzes('기초');
      }
    } catch (error) {
      console.error('추천 퀴즈 조회 실패:', error);
      return {
        success: false,
        error: '추천 퀴즈를 불러오는 중 오류가 발생했습니다.',
        quizzes: []
      };
    }
  }
};

export default quizService; 