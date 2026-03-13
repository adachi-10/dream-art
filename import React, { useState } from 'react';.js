import React, { useState } from 'react';
import '../styles/DreamAnalyzer.css';

const DreamAnalyzer = ({ onAnalysisComplete }) => {
  const [dreamInput, setDreamInput] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [selectedWords, setSelectedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // input, analysis, selection, complete
  const [error, setError] = useState('');

  const keywords = ['死', '生', '人', '絶望'];

  const handleAnalyzeDream = async () => {
    if (dreamInput.trim().length === 0) {
      setError('夢の内容を入力してください');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/dream/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamContent: dreamInput }),
      });

      if (!response.ok) {
        throw new Error('分析処理に失敗しました');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setStep('analysis');
    } catch (err) {
      setError(err.message || '分析処理に失敗しました');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWordSelection = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      if (selectedWords.length < 2) {
        setSelectedWords([...selectedWords, word]);
      } else {
        setError('最大2つまで選択できます');
      }
    }
  };

  const handleSubmitSelection = async () => {
    if (selectedWords.length === 0) {
      setError('少なくとも1つの単語を選択してください');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/dream/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamContent: dreamInput,
          analysis: analysis,
          selectedWords: selectedWords,
        }),
      });

      if (!response.ok) {
        throw new Error('送信処理に失敗しました');
      }

      const data = await response.json();
      setStep('complete');
      
      // 親コンポーネントにモデルデータを渡す
      if (onAnalysisComplete) {
        onAnalysisComplete({
          selectedWords,
          models: data.models,
        });
      }
    } catch (err) {
      setError(err.message || '送信処理に失敗しました');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDreamInput('');
    setAnalysis('');
    setSelectedWords([]);
    setStep('input');
    setError('');
  };

  return (
    <div className="dream-analyzer">
      <h1>🌙 夢分析システム</h1>

      {error && <div className="error-message">{error}</div>}

      {step === 'input' && (
        <div className="input-section">
          <h2>今日見た夢を教えてください</h2>
          <textarea
            value={dreamInput}
            onChange={(e) => setDreamInput(e.target.value)}
            placeholder="夢の内容を150字程度で入力してください..."
            rows={6}
            maxLength={300}
            className="dream-input"
          />
          <div className="char-count">
            {dreamInput.length} / 300字
          </div>
          <button
            onClick={handleAnalyzeDream}
            disabled={loading || dreamInput.trim().length === 0}
            className="btn-primary"
          >
            {loading ? '分析中...' : '分析する'}
          </button>
        </div>
      )}

      {step === 'analysis' && (
        <div className="analysis-section">
          <h2>📊 分析結果</h2>
          <div className="dream-content">
            <h3>あなたの夢:</h3>
            <p>{dreamInput}</p>
          </div>
          <div className="analysis-result">
            <h3>フロイト・ユング的分析:</h3>
            <p>{analysis}</p>
          </div>
          <button
            onClick={() => setStep('selection')}
            className="btn-secondary"
          >
            単語を選択する
          </button>
        </div>
      )}

      {step === 'selection' && (
        <div className="selection-section">
          <h2>✨ 分析結果から最も近いニュアンスの単語を選択</h2>
          <p>1つまたは2つ選択してください</p>
          <div className="keyword-selector">
            {keywords.map((word) => (
              <button
                key={word}
                onClick={() => handleWordSelection(word)}
                className={`keyword-btn ${selectedWords.includes(word) ? 'selected' : ''}`}
              >
                {word}
              </button>
            ))}
          </div>
          <div className="selected-words">
            <h3>選択中の単語:</h3>
            <div className="selected-list">
              {selectedWords.length > 0 ? (
                selectedWords.map((word) => (
                  <span key={word} className="selected-tag">{word}</span>
                ))
              ) : (
                <p className="empty-state">単語を選択してください</p>
              )}
            </div>
          </div>
          <div className="button-group">
            <button
              onClick={handleSubmitSelection}
              disabled={loading || selectedWords.length === 0}
              className="btn-primary"
            >
              {loading ? '送信中...' : '結果を送信'}
            </button>
            <button
              onClick={() => setStep('analysis')}
              className="btn-secondary"
            >
              戻る
            </button>
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="complete-section">
          <h2>✓ 送信完了</h2>
          <p>夢分析の結果を送信しました。</p>
          <p>選択した単語: <strong>{selectedWords.join('、')}</strong></p>
          <button
            onClick={handleReset}
            className="btn-primary"
          >
            新しい夢を分析する
          </button>
        </div>
      )}
    </div>
  );
};

export default DreamAnalyzer;