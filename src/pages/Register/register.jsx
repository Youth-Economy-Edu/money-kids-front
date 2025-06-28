// src/pages/Register.jsx
import React, { useState } from "react";
import { authAPI } from "../../utils/apiClient.js";
import "./register.css"; // 회원가입 전용 CSS
import Toast from "../../components/Toast";

const Register = () => {
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [toast, setToast] = useState({ show: false, type: 'info', message: '' });

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const hideToast = () => {
        setToast({ show: false, type: 'info', message: '' });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!id || !name || !password) {
            showToast('warning', '모든 항목을 입력해주세요.');
            return;
        }

        try {
            const result = await authAPI.register({ id, name, password });

            if (result.success) {
                showToast('success', '회원가입 성공! 로그인 페이지로 이동합니다.');
                
                // 성공 토스트 표시 후 페이지 이동
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else {
                showToast('error', result.error || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            showToast('error', error.message || '회원가입에 실패했습니다.');
        }
    };

    return (
        <div className="register-container">
            <Toast
                type={toast.type}
                message={toast.message}
                show={toast.show}
                onClose={hideToast}
                position="top-center"
                duration={4000}
            />
            
            <form className="register-form" onSubmit={handleRegister}>
                <h2>회원가입</h2>
                <input
                    type="text"
                    placeholder="아이디"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">회원가입</button>
                <p style={{ marginTop: "12px" }}>
                    이미 회원이신가요? <a href="/login">로그인</a>
                </p>
            </form>
        </div>
    );
};

export default Register;
