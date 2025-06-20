// API 기본 설정 - Vite 프록시 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// HTTP 요청 함수
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include', // 쿠키 포함
  };

  // Content-Type 설정
  if (options.body && !options.headers?.['Content-Type']) {
    if (typeof options.body === 'string' && options.body.includes('=')) {
      // URLSearchParams 형식
      defaultOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else {
      // JSON 형식
      defaultOptions.headers['Content-Type'] = 'application/json';
    }
  }

  // 인증 토큰이 있는 경우 헤더에 추가
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`API 요청: ${config.method} ${url}`);
    if (config.body) {
      console.log('요청 본문:', config.body);
    }
    
    const response = await fetch(url, config);
    
    // 응답 텍스트를 먼저 읽기
    const responseText = await response.text();
    console.log(`API 응답 상태: ${response.status}`);
    console.log(`API 응답 텍스트:`, responseText);
    
    // 응답이 비어있지 않으면 JSON으로 파싱
    let data = {};
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.warn('JSON 파싱 실패, 텍스트 응답:', responseText);
        data = { message: responseText };
      }
    }
    
    // 응답 상태 확인
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
    
  } catch (error) {
    console.error(`API 오류 (${endpoint}):`, error);
    
    // 네트워크 오류인 경우
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
    
    throw error;
  }
};

// GET 요청
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

// POST 요청
export const post = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// PUT 요청
export const put = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// DELETE 요청
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
};

// PATCH 요청
export const patch = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// 파일 업로드 요청
export const uploadFile = async (endpoint, file, additionalData = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // 추가 데이터가 있는 경우 FormData에 추가
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });

  const token = localStorage.getItem('authToken');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `파일 업로드 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    throw error;
  }
};

// 토큰 저장
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// 토큰 가져오기
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// 토큰 제거
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// axios 스타일 API 객체
const api = {
  get: async (endpoint, config = {}) => {
    const params = config.params || {};
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const data = await apiRequest(url, { 
      method: 'GET',
      ...config 
    });
    
    return { data };
  },
  
  post: async (endpoint, data = null, config = {}) => {
    let body = null;
    
    if (data !== null) {
      if (config.params) {
        // URLSearchParams 형태로 전송
        const params = new URLSearchParams();
        Object.keys(config.params).forEach(key => {
          params.append(key, config.params[key]);
        });
        body = params.toString();
        config.headers = {
          ...config.headers,
          'Content-Type': 'application/x-www-form-urlencoded'
        };
      } else {
        // JSON 형태로 전송
        body = JSON.stringify(data);
        config.headers = {
          ...config.headers,
          'Content-Type': 'application/json'
        };
      }
    } else if (config.params) {
      // data가 null이고 params가 있는 경우 (Query Parameters)
      const params = new URLSearchParams(config.params).toString();
      endpoint = `${endpoint}?${params}`;
    }
    
    const responseData = await apiRequest(endpoint, {
      method: 'POST',
      body,
      ...config
    });
    
    return { data: responseData };
  },
  
  put: async (endpoint, data, config = {}) => {
    const responseData = await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      ...config
    });
    
    return { data: responseData };
  },
  
  delete: async (endpoint, config = {}) => {
    const data = await apiRequest(endpoint, {
      method: 'DELETE',
      ...config
    });
    
    return { data };
  }
};

// Default export 추가
export default api; 