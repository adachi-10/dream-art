import React, { useState, useEffect, useRef } from "react";
import "../styles/Collection.css";

// 各モデルに対応する基本カラーマップ
const BACKGROUND_COLORS = {
  "死": "#2A2A2A",
  "欲望": "#382941",
  "生": "#52566E",
  "社交": "#977650",
  "自由": "#60A8B3",
  "恐怖": "#222222"
};

// HEXカラーコードをすりガラス用に適した半透明RGBAに変換するヘルパー関数
const hexToRgba = (hex, alpha = 0.65) => {
  if (!hex) return `rgba(82, 86, 110, ${alpha})`;
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((char) => char + char).join("");
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ALL_MODELS = [
  { key: "死", video: "/video/death.mp4", audio: "/audio/death-bgm.mp3", image: "/images/death.png" },
  { key: "欲望", video: "/video/want.mp4", audio: "/audio/want-bgm.mp3", image: "/images/want.png" },
  { key: "生", video: "/video/human.mp4", audio: "/audio/human-bgm.mp3", image: "/images/human.png" },
  { key: "社交", video: "/video/social.mp4", audio: "/audio/social.mp3", image: "/images/social.png" },
  { key: "自由", video: "/video/freedom.mp4", audio: "/audio/freedom.mp3", image: "/images/freedom.png" },
  { key: "恐怖", video: "/video/fear.mp4", audio: "/audio/fear.mp3", image: "/images/fear.png" },
  { key: "孤独", video: "/video/fear.mp4", audio: "/audio/fear.mp3", image: "/images/fear.png" }
];

export default function Collection({ unlockedKeys = [] }) {
  const [selectedModel, setSelectedModel] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (selectedModel && selectedModel.audio) {
      const audio = new Audio(selectedModel.audio);
      audio.loop = true;
      audio.volume = 0.4;
      audioRef.current = audio;
      audio.play().catch((err) => console.log("BGM再生制限:", err));

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [selectedModel]);

  const handleCardClick = (model, isUnlocked) => {
    if (!isUnlocked) return;
    setSelectedModel(model);
  };

  const handleCloseModal = () => setSelectedModel(null);

  return (
    <div className="collection-container">
      <h1 className="collection-title">コレクション機能</h1>

      {/* 3x3 グリッド表示 */}
      <div className="collection-grid">
        {ALL_MODELS.map((model, index) => {
          const isUnlocked = 
            !model.isUpcoming && 
            unlockedKeys.some(k => String(k).trim() === model.key);

          const baseColor = BACKGROUND_COLORS[model.key];
          const unlockedStyle = isUnlocked ? {
            background: `linear-gradient(135deg, ${hexToRgba(baseColor, 0.75)}, ${hexToRgba(baseColor, 0.45)})`,
          } : {};

          return (
            <div
              key={index}
              className={`collection-card ${isUnlocked ? "is-unlocked" : "is-locked"}`}
              style={unlockedStyle}
              onClick={() => handleCardClick(model, isUnlocked)}
            >
              {isUnlocked ? (
                <img
                  src={model.image}
                  alt={model.key}
                  className="collection-thumbnail"
                  onError={(e) => { 
                    e.target.src = "/アイコン.png"; 
                  }}
                />
              ) : (
                <div className="locked-circle">
                  <span className="locked-question-mark">？</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 詳細ポップアップ */}
      {selectedModel && (
        <div className="collection-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="collection-result-view"
            style={{ backgroundColor: BACKGROUND_COLORS[selectedModel.key] || "#52566E" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="collection-close-btn" onClick={handleCloseModal}>
              ✕
            </button>

            <div className="collection-video-area">
              <video
                src={selectedModel.video}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: "600px",
                  objectFit: "contain"
                }}
              />
            </div>

            <div className="collection-keyword-area">
              <span className="collection-keyword-text">
                {selectedModel.key}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}