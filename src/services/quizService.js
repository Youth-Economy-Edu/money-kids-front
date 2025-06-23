// 퀴즈 관련 API 서비스

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * 퀴즈 세션 완료 API 호출
 * @param {string} userId - 사용자 ID
 * @param {number} quizLevel - 퀴즈 난이도 (1-5)
 * @param {number} totalQuestions - 총 문제 수
 * @param {number} correctAnswers - 정답 수
 * @returns {Promise<Object>} 완료 결과
 */
export const completeQuizSession = async (userId, quizLevel, totalQuestions, correctAnswers) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quizzes/session/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                quizLevel,
                totalQuestions,
                correctAnswers
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.code === 200) {
            return result.data;
        } else {
            throw new Error(result.msg || '퀴즈 세션 완료 실패');
        }
    } catch (error) {
        console.error('퀴즈 세션 완료 API 오류:', error);
        throw error;
    }
};

/**
 * 난이도별 랜덤 퀴즈 조회
 * @param {string} level - 퀴즈 난이도
 * @returns {Promise<Array>} 퀴즈 목록
 */
export const getRandomQuizzes = async (level) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quizzes/random?level=${level}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.code === 200) {
            return result.data;
        } else {
            throw new Error(result.msg || '퀴즈 조회 실패');
        }
    } catch (error) {
        console.error('퀴즈 조회 API 오류:', error);
        throw error;
    }
};

/**
 * 사용자 퀴즈 진행 현황 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 퀴즈 진행 현황
 */
export const getUserQuizProgress = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quizzes/user/${userId}/progress`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.code === 200) {
            return result.data;
        } else {
            throw new Error(result.msg || '퀴즈 진행 현황 조회 실패');
        }
    } catch (error) {
        console.error('퀴즈 진행 현황 조회 API 오류:', error);
        throw error;
    }
};

/**
 * 퀴즈 결과 조회
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Array>} 퀴즈 결과 목록
 */
export const getQuizResults = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quizzes/result?user_id=${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.code === 200) {
            return result.data;
        } else {
            throw new Error(result.msg || '퀴즈 결과 조회 실패');
        }
    } catch (error) {
        console.error('퀴즈 결과 조회 API 오류:', error);
        throw error;
    }
}; 