

import { useState } from "react";

export default function DreamAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeDream = async () => {
    setLoading(true);
    setResult(null);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="analyzer">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="夢の内容を入力してください"
      />

      <button onClick={analyzeDream}>分析する</button>

      {loading && <p>分析中...</p>}

      {result && (
        <div>
          <h2>分析結果</h2>
          <p>{result.summary}</p>
        </div>
      )}
    </div>
  );
}

