import { apiRequest, setAuthToken, removeAuthToken } from './api.js';

// 카카오 SDK 초기화
const initKakao = () => {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    // 실제 카카오 앱 키를 환경변수에서 가져오기
    const kakaoAppKey = import.meta.env.VITE_KAKAO_APP_KEY || 'f0000836b2b14b179ea566e5e66ef579';
    window.Kakao.init(kakaoAppKey);
  }
};

// 구글 SDK 초기화
const initGoogle = () => {
  return new Promise((resolve) => {
    if (window.google && window.google.accounts) {
      resolve();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      document.head.appendChild(script);
    }
  });
};

// 인증 서비스
export const authService = {
  // 회원가입
  signup: async (userData) => {
    try {
      // RequestParam 형식으로 데이터 전송
      const params = new URLSearchParams({
        id: userData.email, // 백엔드에서는 id를 사용
        name: userData.name,
        password: userData.password
      });

      const response = await apiRequest('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      // 새로운 응답 형식 처리
      if (response.success && response.user) {
        // 사용자 ID를 로컬스토리지에 저장
        localStorage.setItem('currentUserId', response.user.id);

        return {
          success: true,
          user: {
            id: response.user.id,
            name: response.user.name,
            email: response.user.id, // id를 email로 사용
            type: 'student',
            level: 1,
            points: response.user.points || 0,
            tendency: response.user.tendency,
            age: userData.age,
            school: userData.school,
            grade: userData.grade,
            joinDate: new Date().toISOString(),
            portfolio: 1000000,
            completedQuizzes: 0,
            studyDays: 1
          },
          message: response.message
        };
      }

      throw new Error(response.error || '회원가입에 실패했습니다.');
    } catch (error) {
      console.error('백엔드 회원가입 API 오류:', error);

      // 에러 메시지가 있으면 그대로 전달
      if (error.message) {
        throw error;
      }

      // 백엔드 연결 실패 시 로컬에서 처리 (개발/데모용)
      return {
        success: true,
        user: {
          id: `user_${Date.now()}`,
          name: userData.name,
          email: userData.email,
          type: userData.type || 'student',
          level: 1,
          points: 0,
          age: userData.age,
          school: userData.school,
          grade: userData.grade,
          joinDate: new Date().toISOString(),
          portfolio: 1000000,
          completedQuizzes: 0,
          studyDays: 1
        }
      };
    }
  },

  // 로그인
  login: async (credentials) => {
    try {
      // RequestParam 형식으로 데이터 전송
      const params = new URLSearchParams({
        id: credentials.email, // 백엔드에서는 id를 사용
        password: credentials.password
      });

      const response = await apiRequest('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      // 새로운 응답 형식 처리
      if (response.success && response.user) {
        // 사용자 ID를 로컬스토리지에 저장
        localStorage.setItem('currentUserId', response.user.id);

        return {
          success: true,
          user: {
            id: response.user.id,
            name: response.user.name,
            email: response.user.id, // id를 email로 사용
            type: 'student',
            level: 3,
            points: response.user.points || 0,
            tendency: response.user.tendency,
            joinDate: new Date().toISOString(),
            portfolio: 1250000,
            completedQuizzes: 12,
            studyDays: 7
          },
          message: response.message
        };
      }

      throw new Error(response.error || '로그인에 실패했습니다.');
    } catch (error) {
      console.error('백엔드 로그인 API 오류:', error);

      // 백엔드 연결 실패 시 데모 로그인 처리
      if (credentials.email === 'demo@student.com' || credentials.email === 'student') {
        return {
          success: true,
          user: {
            id: 'demo_student',
            name: '김학생',
            email: 'demo@student.com',
            type: 'student',
            level: 3,
            points: 1500,
            age: 16,
            school: '서울고등학교',
            grade: '고2',
            joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            portfolio: 1250000,
            completedQuizzes: 12,
            studyDays: 7
          }
        };
      }

      // 기본 로그인 실패
      throw new Error(error.message || '로그인 정보가 올바르지 않습니다.');
    }
  },

  // 카카오 로그인
  kakaoLogin: async () => {
    try {
      initKakao();

      return new Promise((resolve, reject) => {
        if (window.Kakao && window.Kakao.isInitialized()) {
          window.Kakao.Auth.login({
            success: async (authObj) => {
              try {
                // 사용자 정보 요청
                window.Kakao.API.request({
                  url: '/v2/user/me',
                  success: async (userInfo) => {
                    try {
                      // 백엔드에 카카오 로그인 정보 전송
                      const response = await apiRequest('/auth/kakao', {
                        method: 'POST',
                        body: JSON.stringify({
                          kakaoId: userInfo.id,
                          nickname: userInfo.properties?.nickname,
                          email: userInfo.kakao_account?.email,
                          accessToken: authObj.access_token
                        })
                      });

                      if (response.token) {
                        setAuthToken(response.token);
                      }

                      resolve({
                        success: true,
                        user: response.user || response.data
                      });
                    } catch (apiError) {
                      console.warn('백엔드 카카오 로그인 API 실패, 로컬 처리:', apiError);

                      // 백엔드 실패시 로컬 처리
                      const userData = {
                        id: `kakao_${userInfo.id}`,
                        name: userInfo.properties?.nickname || '카카오 사용자',
                        email: userInfo.kakao_account?.email || 'kakao@example.com',
                        type: 'student',
                        level: 1,
                        points: 0,
                        provider: 'kakao',
                        joinDate: new Date().toISOString(),
                        portfolio: 1000000,
                        completedQuizzes: 0,
                        studyDays: 1
                      };

                      resolve({
                        success: true,
                        user: userData
                      });
                    }
                  },
                  fail: (error) => {
                    console.error('카카오 사용자 정보 요청 실패:', error);
                    reject(new Error('카카오 사용자 정보를 가져올 수 없습니다.'));
                  }
                });
              } catch (error) {
                reject(error);
              }
            },
            fail: (error) => {
              console.error('카카오 로그인 실패:', error);
              reject(new Error('카카오 로그인에 실패했습니다.'));
            }
          });
        } else {
          // 카카오 SDK가 없는 경우 데모 처리
          console.warn('카카오 SDK가 로드되지 않음, 데모 로그인 처리');
          resolve({
            success: true,
            user: {
              id: `kakao_demo_${Date.now()}`,
              name: '카카오 데모',
              email: 'kakao@demo.com',
              type: 'student',
              level: 1,
              points: 0,
              provider: 'kakao',
              joinDate: new Date().toISOString(),
              portfolio: 1000000,
              completedQuizzes: 0,
              studyDays: 1
            }
          });
        }
      });
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      throw new Error('카카오 로그인 중 오류가 발생했습니다.');
    }
  },

  // 구글 로그인
  googleLogin: async () => {
    try {
      await initGoogle();

      return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
          const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '171600218391-r73m2hd5uhdu5s6c2qm67kspru29ckfi.apps.googleusercontent.com';

          // OAuth2 클라이언트 초기화
          const client = window.google.accounts.oauth2.initCodeClient({
            client_id: googleClientId,
            scope: 'email profile',
            ux_mode: 'popup',
            callback: async (response) => {
              if (response.code) {
                try {
                  // 백엔드에 인증 코드 전송
                  const apiResponse = await apiRequest('/auth/google', {
                    method: 'POST',
                    body: JSON.stringify({
                      code: response.code
                    })
                  });

                  if (apiResponse.token) {
                    setAuthToken(apiResponse.token);
                  }

                  resolve({
                    success: true,
                    user: apiResponse.user || apiResponse.data
                  });
                } catch (apiError) {
                  console.warn('백엔드 구글 로그인 API 실패, 로컬 처리:', apiError);

                  // 백엔드 연결 실패 시 데모 처리
                  const userData = {
                    id: `google_demo_${Date.now()}`,
                    name: '구글 데모',
                    email: 'google@demo.com',
                    type: 'student',
                    level: 1,
                    points: 0,
                    provider: 'google',
                    joinDate: new Date().toISOString(),
                    portfolio: 1000000,
                    completedQuizzes: 0,
                    studyDays: 1
                  };

                  resolve({
                    success: true,
                    user: userData
                  });
                }
              } else {
                reject(new Error('구글 로그인 취소'));
              }
            }
          });

          // 로그인 창 바로 실행
          client.requestCode();
        } else {
          // 구글 SDK가 없는 경우 데모 처리
          console.warn('구글 SDK가 로드되지 않음, 데모 로그인 처리');
          resolve({
            success: true,
            user: {
              id: `google_demo_${Date.now()}`,
              name: '구글 데모',
              email: 'google@demo.com',
              type: 'student',
              level: 1,
              points: 0,
              provider: 'google',
              joinDate: new Date().toISOString(),
              portfolio: 1000000,
              completedQuizzes: 0,
              studyDays: 1
            }
          });
        }
      });
    } catch (error) {
      console.error('구글 로그인 오류:', error);
      throw new Error('구글 로그인 중 오류가 발생했습니다.');
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      // 백엔드에 로그아웃 요청
      await apiRequest('/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.warn('백엔드 로그아웃 API 연결 실패:', error);
    } finally {
      // 로컬 토큰 제거
      removeAuthToken();
      localStorage.removeItem('currentUserId');
      
      // 카카오 로그아웃
      if (window.Kakao && window.Kakao.Auth) {
        window.Kakao.Auth.logout();
      }
      
      // 구글 로그아웃
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      return { success: true };
    }
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    try {
      const userId = localStorage.getItem('currentUserId');
      if (!userId) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const response = await apiRequest(`/users/${userId}`);
      return {
        success: true,
        user: {
          id: response.data.id,
          name: response.data.name,
          email: response.data.id,
          points: response.data.points || 0,
          tendency: response.data.tendency
        }
      };
    } catch (error) {
      console.warn('사용자 정보 조회 실패:', error);
      throw error;
    }
  },

  // 사용자 정보 업데이트
  updateUserInfo: async (userId, userData) => {
    try {
      const response = await apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      return {
        success: true,
        user: response.user || response.data
      };
    } catch (error) {
      console.warn('사용자 정보 업데이트 실패:', error);
      throw error;
    }
  },

  // 토큰 갱신
  refreshToken: async () => {
    try {
      const response = await apiRequest('/auth/refresh', {
        method: 'POST'
      });
      
      if (response.token) {
        setAuthToken(response.token);
      }
      
      return {
        success: true,
        token: response.token
      };
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      throw error;
    }
  }
}; 