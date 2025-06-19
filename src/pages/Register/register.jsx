// src/pages/Register.jsx
import React, { useState } from "react";
import axios from "axios";
import "./register.css"; // 회원가입 전용 CSS

const Register = () => {
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!id || !name || !password) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        try {
            const response = await axios.post(
                "/api/auth/register",
                new URLSearchParams({ id, name, password }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            alert("회원가입 성공! 로그인 페이지로 이동합니다.");
            window.location.href = "/login";
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "회원가입 실패";
            alert(msg);
        }
    };

    return (
        <div className="register-container">
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
            </form>
        </div>
    );
};

export default Register;
