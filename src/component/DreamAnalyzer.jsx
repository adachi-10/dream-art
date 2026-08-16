import "../styles/DreamAnalyzer.css";
import { useState, useEffect, useRef } from "react";
import DreamModel from "./DreamModel";
import { useDeepAnalysisStorage } from "../hooks/useDeepAnalysisStorage";
import { formatRadarChartData, formatHistoryTransitionData } from "../utils/formatDeepAnalysisData";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

const API_BASE_URL = import.meta.env.PROD
  ? "https://dream-art.onrender.com"
  : "http://localhost:5000";

const BACKGROUND_COLORS = {
  "死": "#2A2A2A",
  "欲望": "#382941",
  "生": "#52566E",
  "社交": "#977650",
  "恐怖": "#222222",
  "自由": "#60A8B3"
};

const DYNAMIC_QUESTIONS = {
  "死": "今、終わらせたいこと、終わってほしいことなどはありますか？",
  "生": "最近始めたことや、新しく始めたいことはありますか？",
  "欲望": "本当は手に入れたいのに、見ないふりをしている望みはありますか？",
  "社交": "周りの人との関係で、性格や感情を演じている部分はありますか？",
  "恐怖": "今、避けて通りたいと感じている不安やプレッシャーはありますか？",
  "自由": "日常の中で、もっと解き放ちたいと感じている制約はありますか？"
};

const SHADOW_DESCRIPTIONS = {
  "ヒーロー": "隠れた潜在能力を発揮することを恐れ、生み出されることへの葛藤を抱えています。周囲の過度な期待や自分自身の完璧主義に応えようとするあまり、本当の自分を犠牲にしている可能性があります。",
  "トリックスター": "既存のルールや常識を打ち破りたいという無意識の欲求が高まっています。抑圧されたユーモアや破壊的創造力が解放を求めています。",
  "賢者": "物事の真理や知識を極めたい反面、現実の複雑な感情から逃避したい内面を表しています。",
  "アニマ": "感性や直感、内なる女性性（または感受性）との統合を求めています。",
  "孤児": "どこにも属せない孤独感や、自立への恐れと望みが複雑に交錯しています。",
  "破壊者": "不要になった執着や過去の自分をリセットし、新しいスタートを切りたい強い衝動の現れです。"
};

const ARCHETYPE_IMAGES = {
  "創造者": "/images/archetypes/creator.png",
  "英雄": "/images/archetypes/hero.png",
  "恋人": "/images/archetypes/lover.png",
  "賢者": "/images/archetypes/sage.png",
  "反逆者": "/images/archetypes/rebel.png",
  "無垢": "/images/archetypes/innocent.png"
};

// ResultCard コンポーネント
const ResultCard = ({ 
  item, 
  isHistory = false, 
  currentModelKey, 
  resultRef, 
  formatDate, 
  q1, 
  setQ1, 
  q2, 
  setQ2, 
  pendingCount, 
  handleSaveReflection 
}) => {
  const resData = item?.result || item;
  const modelKeyToShow = 
    (resData?.modelKeys && resData.modelKeys[0]) || 
    resData?.modelKey || 
    (Array.isArray(resData?.selectedWords) && resData.selectedWords[0]) ||
    currentModelKey || 
    "生";

  const currentBgColor = BACKGROUND_COLORS[modelKeyToShow] || "#52566E";
  const dynamicQ2Text = DYNAMIC_QUESTIONS[modelKeyToShow] || "この象徴について思い当たる感情はありますか？";

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

      <div className="model-section">
        <DreamModel modelKey={modelKeyToShow} />
      </div>

      <div className="keywords-display">
        <div className="keywords-tags">
          <span className="keyword-tag">
            {modelKeyToShow}
            <span className="decoration-box"></span>
          </span>
        </div>
      </div>

      <div className="analysis-section">
        <p className="analysis-text">{resData?.summary || resData?.analysis}</p>
      </div>

      {/* 内省フォーム */}
      {!isHistory && (
        <div className="reflection-card">
          <h2 className="reflection-main-title">更に深層心理を分析する</h2>
          
          <div className="reflection-field">
            <label htmlFor="q1-input">Q1. 今の自分の状況・感じたこと</label>
            <textarea 
              id="q1-input"
              className="reflection-textarea"
              rows={5}
              value={q1} 
              onChange={(e) => setQ1(e.target.value)}
              placeholder="現実で起きていることや、今感じている感情を自由に入力してください..."
            />
          </div>

          <div className="reflection-field">
            <label htmlFor="q2-input">Q2. 【{modelKeyToShow}】{dynamicQ2Text}</label>
            <textarea 
              id="q2-input"
              className="reflection-textarea"
              rows={5}
              value={q2} 
              onChange={(e) => setQ2(e.target.value)}
              placeholder="直感で思い浮かんだ答えを入力してください..."
            />
          </div>

          <div className="reflection-btn-container">
            <button 
              className="reflection-save-btn"
              onClick={handleSaveReflection}
              disabled={!q1.trim() || !q2.trim()}
            >
              内省ログを保存（{pendingCount + 1} / 3）
            </button>
          </div>
        </div>
      )}

      <div className="custom-footer-message">
        <p>結果については自分の深層心理について考えるきっかけとしてください。明日もいい夢を</p>
      </div>
    </div>
  );
};

export default function DreamAnalyzer({ onAnalyzeSuccess, currentModelKey, showHistoryOnly, activeTab }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");

  const { 
    pendingCount, 
    deepHistory, 
    latestAnalysis, 
    isAnalyzing, 
    addSession 
  } = useDeepAnalysisStorage();

  const resultRef = useRef(null);

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

    try {
      const response = await fetch(`${API_BASE_URL}/api/dream/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamContent: text }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();

      const normalized = {
        ...data,
        modelKeys: Array.isArray(data.modelKeys)
          ? data.modelKeys.slice(0, 2)
          : data.modelKey
          ? [data.modelKey]
          : ["生"],
      };

      setResult(normalized);

      if (normalized.modelKeys.length > 0 && onAnalyzeSuccess) {
        onAnalyzeSuccess(normalized.modelKeys);
      }

      try {
        const newKey = normalized.modelKeys[0];
        if (newKey) {
          const rawSaved = localStorage.getItem("dream_art_unlocked_models");
          const savedKeys = rawSaved ? JSON.parse(rawSaved) : [];
          if (Array.isArray(savedKeys) && !savedKeys.includes(newKey)) {
            const updatedKeys = [...savedKeys, newKey];
            localStorage.setItem("dream_art_unlocked_models", JSON.stringify(updatedKeys));
          }
        }
      } catch (storageErr) {
        console.warn("コレクション解放保存のエラー:", storageErr);
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
      setResult({ error: error.message || "分析に失敗しました。" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReflection = async () => {
    if (!q1.trim() || !q2.trim()) return;

    const resData = result;
    const key = (resData?.modelKeys && resData.modelKeys[0]) || resData?.modelKey || "生";

    const currentCount = pendingCount + 1;

    await addSession({
      dream: text,
      summary: resData?.summary || resData?.analysis,
      keyword: key,
      q1Response: q1,
      q2Response: q2
    });

    setQ1("");
    setQ2("");

    if (currentCount >= 3) {
      alert("3回分の内省ログが蓄積されました！「深層分析」メニューから解析結果を確認できます。");
    } else {
      alert(`内省ログを保存しました（現在 ${currentCount} / 3 件）。あと ${3 - currentCount} 回で深層分析が解放されます！`);
    }
  };

  const clearInput = () => setText("");

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    } catch {
      return iso;
    }
  };

  // 「深層分析」タブ表示モード
  if (activeTab === "deep") {
    const radarData = formatRadarChartData(latestAnalysis?.result?.defenseScores);
    const transitionData = formatHistoryTransitionData(deepHistory);               
    const shadowKey = latestAnalysis?.result?.shadow;

    return (
      <div className="dream-analyzer-container">
        <h1 className="deep-analysis-header">あなたの深層心理</h1>

        {isAnalyzing ? (
          <div className="loading">深層心理（アーキタイプ・防衛機制）を統合解析中...</div>
        ) : latestAnalysis ? (
          <>
            {/* 1. 推移グラフ */}
            {transitionData.length >= 2 && (
              <div className="deep-analysis-card" style={{ marginBottom: "30px" }}>
                <h2 className="deep-section-title">防衛機制の移り変わり（過去{transitionData.length}回の推移）</h2>
                <div style={{ width: "100%", height: 260, marginTop: "20px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={transitionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="label" stroke="#ffffff" />
                      <YAxis domain={[0, 100]} stroke="#ffffff" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#2b2e38", border: "1px solid #555", borderRadius: "8px" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="rationalization" name="合理化" stroke="#f0b8d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="repression" name="投影" stroke="#b8d4f5" strokeWidth={2} />
                      <Line type="monotone" dataKey="reactionFormation" name="反動形成" stroke="#c8aee8" strokeWidth={2} />
                      <Line type="monotone" dataKey="displacement" name="逃避" stroke="#ffd180" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* 2. メインのリザルトカード */}
            <div className="deep-analysis-card">
              {/* 上段：アーキタイプ */}
              {/* 上段：今のあなたのアーキタイプ（左：画像 / 右：テキスト） */}
<div className="deep-shadow-section">
  <h2 className="deep-section-title">今のあなたのアーキタイプ</h2>
  
  <div className="deep-shadow-container">
    {/* 左半分：アーキタイプ画像 */}
    <div className="deep-shadow-image-wrapper">
      {ARCHETYPE_IMAGES[shadowKey] && (
        <img 
          src={ARCHETYPE_IMAGES[shadowKey]} 
          alt={shadowKey} 
          className="archetype-image"
        />
      )}
    </div>

    {/* 右半分：アーキタイプ名 ＋ 解説文 */}
    <div className="deep-shadow-info">
      <div className="deep-shadow-name">{shadowKey}</div>
      <div className="deep-shadow-desc">
        {latestAnalysis.result.shadowDescription || SHADOW_DESCRIPTIONS[shadowKey] || ""}
      </div>
    </div>
  </div>
              </div>

              {/* 下段：防衛機制 */}
              <div className="deep-defense-section-container" style={{ marginTop: "32px" }}>
                <h2 className="deep-section-title">今のあなたの防衛機制</h2>
                
                <div className="deep-defense-section">
                  <div className="deep-chart-container" style={{ width: "100%", height: "260px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.2)" />
                        <PolarAngleAxis dataKey="subject" stroke="#ffffff" tick={{ fill: '#ffffff', fontSize: 13 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" />
                        <Radar
                          name="防衛機制強度"
                          dataKey="score"
                          stroke="#c8aee8"
                          fill="#b8a0e0"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="deep-defense-info">
                    <div className="deep-defense-title">{latestAnalysis.result.primaryDefense}</div>
                    <div className="deep-defense-desc">{latestAnalysis.result.defenseDescription}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 用語解説 */}
            <div className="glossary-section">
              <h3 className="glossary-title">用語解説</h3>
              <div className="shadow-glossary-card">
                <h4>アーキタイプ（原型）</h4>
                <p>生涯を通して変化する、今の自分が演じがちな役割や動機を指します。全部で六通りの結果があります。</p>
              </div>
            </div>

            {/* 防衛機制の基礎解説 */}
            <div className="defense-glossary-section">
              <h3 className="defense-glossary-title">防衛機制についての基礎解説</h3>
              <div className="defense-glossary-grid">
                <div className="defense-glossary-item">
                  <h4>合理化</h4>
                  <p>受け入れがたい現実や不都合な事態に対し、もっともらしい理由や正当化をつけることで、自分の自尊心を守り納得させようとする心理的メカニズムです。</p>
                </div>
                <div className="defense-glossary-item">
                  <h4>投影</h4>
                  <p>自分の中にあるマイナスな感情や弱点を、自分ではなく他人にあると感じることで事実から目を背ける防衛反応です。</p>
                </div>
                <div className="defense-glossary-item">
                  <h4>反動形成</h4>
                  <p>本心とは真逆の態度や行動を過剰に強調して振る舞うことです。自らの弱さや恐れを隠すために、あえて極端に強く攻撃的に振る舞う傾向などが該当します。</p>
                </div>
                <div className="defense-glossary-item">
                  <h4>逃避</h4>
                  <p>直面したくない現実や不安から目をそらし、別の行動に打ち込むことで心を守る働きです。</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="deep-analysis-card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <h2 style={{ fontSize: "22px", marginBottom: "16px" }}>まだ深層分析データがありません</h2>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.8" }}>
              夢分析を行った後、「内省の記録」を <strong>3回分</strong> 蓄積すると<br />
              あなたの「アーキタイプ」と「防衛機制の傾向」がここに分析・出力されます。<br />
              （現在: <strong>{pendingCount} / 3</strong> 件蓄積済み）
            </p>
          </div>
        )}
      </div>
    );
  }

  // 通常の夢分析画面
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

      {result && !result.error && (result.summary || result.analysis || result.modelKeys?.length > 0) && (
        <ResultCard 
          item={{ result }} 
          currentModelKey={currentModelKey}
          resultRef={resultRef}
          formatDate={formatDate}
          q1={q1} setQ1={setQ1}
          q2={q2} setQ2={setQ2}
          pendingCount={pendingCount}
          handleSaveReflection={handleSaveReflection}
        />
      )}
    </div>
  );
}