// src/components/DreamAnalyzer.jsx
import "../styles/DreamAnalyzer.css";
import { useState, useEffect, useRef } from "react";
import DreamModel from "./DreamModel";

const BACKGROUND_COLORS = {
  "死": "#2A2A2A",
  "欲望": "#382941",
  "生": "#52566E",
};

export default function DreamAnalyzer({ onAnalyzeSuccess, currentModelKey, showHistoryOnly }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0); // 0 = latest

  // 💡 【修正①】漏れていた homeAudioRef の定義を確実に追加
  const homeAudioRef = useRef(null);
  // 自動スクロール用のRef
  const resultRef = useRef(null);

  // 初期ホームBGM（home.mp3）の再生管理
  useEffect(() => {
    const homeAudio = new Audio("/audio/home.mp3");
    homeAudio.loop = true;
    homeAudio.volume = 0.3;
    homeAudioRef.current = homeAudio;

    homeAudio.play().catch((err) => {
      console.log("ホームBGMはユーザーのアクション後に再生されます:", err);
    });

    return () => {
      if (homeAudioRef.current) {
        homeAudioRef.current.pause();
        homeAudioRef.current = null;
      }
    };
  }, []);

 
  useEffect(() => {
    if (result && !result.error && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100); 
    }
  }, [result, historyIndex]);

  const analyzeDream = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

   
    if (homeAudioRef.current) {
      try {
        homeAudioRef.current.pause();
      } catch (e) {
        console.log("BGMの停止処理スキップ:", e);
      }
    }

    try {
      // 末尾をサーバーの記述と完全に一致させる
// 修正後
const response = await fetch('http://localhost:5000/api/dream/analyze', { // 👈 /analyze を追加
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ dreamContent: text }), // 👈 キーを text から dreamContent に変更
});

if (!response.ok) throw new Error(`API Error: ${response.status}`);

const data = await response.json();

      const normalized = {
        ...data,
        modelKeys: Array.isArray(data.modelKeys)
          ? data.modelKeys.slice(0, 2)
          : data.modelKey
          ? [data.modelKey]
          : [],
      };

      setResult(normalized);
      setLoading(false);

      if (normalized.modelKeys.length > 0 && onAnalyzeSuccess) {
        onAnalyzeSuccess(normalized.modelKeys);
      }

      setHistory((prev) => {
        const next = [
          { text, result: normalized, time: new Date().toISOString() },
          ...prev,
        ];
        return next.slice(0, 10);
      });
      setHistoryIndex(0);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: error.message });
      setLoading(false);
    }
  };

  useEffect(() => {
    const maxIndex = Math.max(0, history.length - 1);
    if (historyIndex > maxIndex) {
      setHistoryIndex(maxIndex);
    }
  }, [history, historyIndex]);

  const clearInput = () => setText("");

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    } catch {
      return iso;
    }
  };

  const showPrevHistory = () => {
    setHistoryIndex((idx) => Math.min(idx + 1, Math.max(0, history.length - 1)));
  };
  const showNextHistory = () => {
    setHistoryIndex((idx) => Math.max(idx - 1, 0));
  };

  const ResultCard = ({ item, isHistory = false }) => {
    const modelKeys = item?.result?.modelKeys && item.result.modelKeys.length > 0
      ? item.result.modelKeys
      : item?.result?.modelKey
      ? [item.result.modelKey]
      : [];

    const modelKeyToShow = modelKeys.length > 0 ? modelKeys[0] : (isHistory ? item?.result?.modelKey : currentModelKey);
    
   
    const currentBgColor = BACKGROUND_COLORS[modelKeyToShow] || BACKGROUND_COLORS["人"];

    return (
      <div 
        ref={resultRef} 
        className="result-section" 
        style={{ 
          backgroundColor: currentBgColor,
          marginBottom: isHistory ? "40px" : "0"
        }}
      >
        {isHistory && (
          <p className="history-date">{formatDate(item.time)}</p>
        )}

        {/* 1. 3D動画セクション（1200x600） */}
        <div className="model-section">
          <DreamModel modelKey={BACKGROUND_COLORS[modelKeyToShow] ? modelKeyToShow : "人"} />
        </div>

        {/* 💡 2. 抽出されたキーワードセクション（動画の真下、一番上に配置） */}
        <div className="keywords-display">
          <div className="keywords-tags">
            {modelKeys.length > 0 ? modelKeys.map((k,i) => (
              /* 💡 白い正方形のデザインを重ねるために、装飾用の空のspanを内側に追加しました */
              <span key={i} className="keyword-tag">
                {k}
                <span className="decoration-box"></span>
              </span>
            )) : (
              <span className="keyword-tag">
                {item.result.modelKey || "（なし）"}
                <span className="decoration-box"></span>
              </span>
            )}
          </div>
        </div>

       
        <div className="analysis-section">
          <p className="analysis-text">{item.result.summary}</p>
        </div>

    
        <div className="custom-footer-message">
          <p>結果については自分の深層心理について考えるきっかけとしてください。明日もいい夢を</p>
        </div>

      </div>
    );
  };

  return (
    <div className="dream-analyzer-container">
      {!showHistoryOnly && (
        <div className="input-section">
          <textarea
            className="dream-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="昨夜はどんな夢を見ましたか？"
            disabled={loading}
          />
          <div className="button-group">
            <button className="clear-btn" onClick={clearInput} disabled={loading}>クリア</button>
            <button className="analyze-btn" onClick={analyzeDream} disabled={loading}>
              {loading ? "分析中..." : "夢を分析する"}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="loading">深層心理を読み解いています...</div>}
      {result?.error && <div className="error-box">{result.error}</div>}

      {showHistoryOnly ? (
        <div className="history-carousel-container">
          <div className="history-carousel-header">
            <h3 style={{ margin: 0, color: "white" }}>過去の夢ログ（最大10件）</h3>
            <div className="history-controls">
              <button
                className="history-arrow"
                onClick={showPrevHistory}
                aria-label="次へ"
                disabled={historyIndex >= Math.max(0, history.length - 1)}
                title="次の履歴"
              >
                ➤
              </button>
              <button
                className="history-arrow"
                onClick={showNextHistory}
                aria-label="前へ"
                style={{ transform: "rotate(180deg)" }}
                disabled={historyIndex <= 0}
                title="以前の履歴"
              >
                ➤
              </button>
            </div>
          </div>

          {history.length > 0 ? (
            <div className="history-carousel">
              <div className="history-item">
                <ResultCard item={history[historyIndex]} isHistory={true} />
              </div>
              <div className="history-index-indicator">
                {historyIndex + 1} / {history.length}
              </div>
            </div>
          ) : (
            <p style={{ color: "white", textAlign: "center" }}>履歴はまだありません</p>
          )}
        </div>
      ) : (
        result && !result.error && <ResultCard item={{ result }} />
      )}
    </div>
  );
}