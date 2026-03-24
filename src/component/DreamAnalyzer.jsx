import "../styles/DreamAnalyzer.css";
import { useState } from "react";
import DreamModel from "./DreamModel";

export default function DreamAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const analyzeDream = async () => {
    if (!text.trim()) {
      setError("夢の内容を入力してください");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setKeywords([]);

    try {
      // ✅ APIに夢を送信
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      console.log("API Response:", data);

      // ✅ 分析結果とキーワードを保存
      setAnalysis(data.analysis);
      setKeywords(data.keywords || []);

      // ✅ 履歴に追加
      setHistory((prev) => [
        {
          text,
          analysis: data.analysis,
          keywords: data.keywords || [],
          timestamp: new Date().toLocaleString("ja-JP"),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText("");
    setAnalysis(null);
    setKeywords([]);
    setError(null);
  };

  return (
    <div className="dream-analyzer-container">
      {/* ヘッダー */}
      <div className="header">
        <h1>✨ 夢分析アプリケーション</h1>
        <p>あなたの夢を入力して、深層心理を分析します</p>
      </div>

      {/* 入力セクション */}
      <div className="input-section">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="夢の内容を詳しく入力してください..."
          disabled={loading}
          className="dream-input"
        />

        <div className="button-group">
          <button
            onClick={analyzeDream}
            disabled={loading || !text.trim()}
            className="analyze-btn"
          >
            {loading ? "🔄 分析中..." : "🔮 分析する"}
          </button>

          <button
            onClick={handleClear}
            disabled={loading || !text.trim()}
            className="clear-btn"
          >
            クリア
          </button>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="error-box">
          <span>❌</span> {error}
        </div>
      )}

      {/* 分析結果セクション */}
      {analysis && (
        <div className="result-section">
          {/* 3Dモデル表示（キーワードがある場合） */}
          {keywords.length > 0 && (
            <div className="model-section">
              <DreamModel
                keywords={keywords}
                onModelComplete={(modelData) => {
                  console.log("Models loaded:", modelData);
                }}
              />
            </div>
          )}

          {/* 分析テキスト */}
          <div className="analysis-section">
            <h2>📖 分析結果</h2>
            <div className="analysis-text">{analysis}</div>

            {/* キーワード表示 */}
            {keywords.length > 0 && (
              <div className="keywords-display">
                <h3>🏷️ 抽出されたキーワード</h3>
                <div className="keywords-tags">
                  {keywords.map((keyword, idx) => (
                    <span key={idx} className="keyword-tag">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 分析履歴セクション */}
      {history.length > 0 && (
        <div className="history-section">
          <h3>📚 分析履歴</h3>
          <div className="history-list">
            {history.map((item, idx) => (
              <div key={idx} className="history-card">
                <div className="history-header">
                  <p className="history-time">⏰ {item.timestamp}</p>
                </div>
                <p className="history-text">"{item.text.substring(0, 100)}..."</p>
                {item.keywords.length > 0 && (
                  <div className="history-tags">
                    {item.keywords.map((kw, i) => (
                      <span key={i} className="history-tag">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}