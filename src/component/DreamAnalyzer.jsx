import "../styles/DreamAnalyzer.css";
import { useState } from "react";
import DreamModel from "./DreamModel"; // パスが正しいか確認してください

export default function DreamAnalyzer({ onAnalyzeSuccess, currentModelKey }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const analyzeDream = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text }), 
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      setResult(data);
      setLoading(false);

      if (data.modelKey && onAnalyzeSuccess) {
        onAnalyzeSuccess(data.modelKey);
      }

      setHistory((prev) => [
        { text, result: data, time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: error.message });
      setLoading(false);
    }
  };

  const clearInput = () => setText("");

  return (
    <div className="dream-analyzer-container">
      {/* 入力セクション */}
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

      {loading && <div className="loading">深層心理を読み解いています...</div>}

      {result?.error && <div className="error-box">{result.error}</div>}

      {/* 結果表示セクション：resultがある時だけ表示されるようにガードされています */}
      {result && !result.error && (
        <div className="result-section">
          
          {/* ★ カード内の3Dモデル表示エリア */}
          <div className="model-section">
            <DreamModel modelKey={currentModelKey} />
          </div>

          <div className="analysis-section">
            <h2>分析結果</h2>
            <p className="analysis-text">{result.summary}</p>
          </div>
          <div className="keywords-display">
            <h3>抽出されたキーワード</h3>
            <div className="keywords-tags">
              <span className="keyword-tag">{result.modelKey}</span>
            </div>
          </div>
        </div>
      )}

      {/* 履歴セクション */}
      {history.length > 0 && (
        <div className="history-section">
          <h3>分析ログ</h3>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-card">
                <p className="history-time">{item.time}</p>
                <p className="history-text">{item.text}</p>
                <div className="history-tags">
                  <span className="history-tag">{item.result.modelKey}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}