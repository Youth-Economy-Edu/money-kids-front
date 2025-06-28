// 안전한 숫자 포맷팅 유틸리티
export const safeToLocaleString = (value) => {
    // undefined, null, NaN, 비숫자 값들을 안전하게 처리
    if (value === null || value === undefined || value === '' || isNaN(value)) {
        return '0';
    }
    
    // 문자열이면 숫자로 변환 시도
    if (typeof value === 'string') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return '0';
        }
        value = numValue;
    }
    
    // 숫자가 아니면 0 반환
    if (typeof value !== 'number') {
        return '0';
    }
    
    try {
        return value.toLocaleString();
    } catch (error) {
        console.warn('toLocaleString failed for value:', value, error);
        return String(value);
    }
};

// 안전한 객체 속성 접근
export const safeGet = (obj, path, defaultValue = 0) => {
    if (!obj) return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue;
        }
        result = result[key];
    }
    
    return result === null || result === undefined ? defaultValue : result;
};

// 안전한 포맷팅 (통화 형태)
export const safeCurrencyFormat = (value) => {
    return `₩${safeToLocaleString(value)}`;
};

// 안전한 퍼센트 포맷팅
export const safePercentFormat = (value) => {
    const num = safeGet({value}, 'value', 0);
    return `${num}%`;
}; 