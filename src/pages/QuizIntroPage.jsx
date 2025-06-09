import { useNavigate } from 'react-router-dom';

function QuizIntroPage() {
    const navigate = useNavigate();

    const handleStart = (count) => {
        navigate(`/quiz/start?count=${count}`);
    };

    return (
        <div style={{ padding: '32px', textAlign: 'center' }}>
            <h1>오늘의 도전 퀴즈 🧠</h1>
            <p>오늘의 실력을 테스트해보세요! 제한 시간 안에 문제를 모두 맞히면 특별 보상이 주어집니다.</p>

            <div style={{ marginTop: '24px' }}>
                <button onClick={() => handleStart(5)} style={buttonStyle}>5문제 도전</button>
                <button onClick={() => handleStart(10)} style={buttonStyle}>10문제 도전</button>
                <button onClick={() => handleStart(20)} style={buttonStyle}>20문제 도전</button>
            </div>
        </div>
    );
}

const buttonStyle = {
    margin: '8px',
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#6366f1',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '16px'
};

export default QuizIntroPage;
