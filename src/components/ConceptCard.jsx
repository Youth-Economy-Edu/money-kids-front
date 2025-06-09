import React from "react";

const ConceptCard = ({ title, color, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: "#fff",
                borderRadius: "20px",
                padding: "24px",
                width: "260px",
                height: "220px", // ✅ 카드 높이 고정
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                cursor: "pointer",
                transition: "transform 0.2s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
            {/* 아이콘 */}
            <div
                style={{
                    backgroundColor: color || "#00000C",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "12px",
                }}
            >
                📘
            </div>

            {/* 제목 + 설명 */}
            <div style={{ textAlign: "left", flexGrow: 1 }}>
                <h3
                    style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        margin: "0 0 8px 0",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: '#00000c',
                        lineHeight: "1.4",
                        maxHeight: "44px",              // 16px * 1.4 * 2줄 ≒ 44px
                        wordBreak: "break-word",        // 긴 단어 줄바꿈 허용
                        whiteSpace: "normal",           // 공백 줄바꿈 허용
                    }}
                >
                    {title}
                </h3>
                <p
                    style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        margin: "0 0 12px 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                </p>
            </div>

            {/* 하단 정보 */}
            <div style={{ color: "#9ca3af", fontSize: "13px", display: "flex", justifyContent: "space-between" }}>
            </div>
        </div>
    );
};

export default ConceptCard;
