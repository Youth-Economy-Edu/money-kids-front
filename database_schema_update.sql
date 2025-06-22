-- StockLog 테이블의 date 컬럼을 DATETIME으로 변경
-- 기존 데이터가 있다면 백업 후 실행하세요

-- 1. 기존 데이터 백업 (옵션)
-- CREATE TABLE stock_log_backup AS SELECT * FROM stock_log;

-- 2. date 컬럼을 DATETIME으로 변경
ALTER TABLE stock_log MODIFY COLUMN date DATETIME;

-- 3. 기존 데이터 업데이트 (문자열 날짜를 DATETIME으로 변환)
-- 기존 데이터가 'YYYY-MM-DD' 형식이라면:
-- UPDATE stock_log SET date = CONCAT(date, ' 09:00:00') WHERE date IS NOT NULL;

-- 확인
DESCRIBE stock_log; 