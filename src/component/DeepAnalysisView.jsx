import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import { useDeepAnalysisStorage } from '../hooks/useDeepAnalysisStorage';
import { formatRadarChartData, formatHistoryTransitionData } from '../utils/formatDeepAnalysisData';
import '../styles/DreamAnalyzer.css';

export default function DeepAnalysisView() {
  const { pendingCount, deepHistory, latestAnalysis, isAnalyzing } = useDeepAnalysisStorage();

  // 最新の防衛機制スコアをRecharts形式に変換
  const radarData = formatRadarChartData(latestAnalysis?.result?.defenseScores);

  // 過去最大5回分の推移データを変換
  const transitionData = formatHistoryTransitionData(deepHistory);

  if (isAnalyzing) {
    return <div className="loading">深層心理（アーキタイプ・防衛機制）を統合解析中...</div>;
  }

  if (!latestAnalysis) {
    return (
      <div className="deep-analysis-card" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2 style={{ fontSize: "22px", marginBottom: "16px" , color: "rgba(255,255,255,0.7)"}}>まだ深層分析データがありません</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.8" }}>
          夢分析を行った後、「内省の記録」を３回分蓄積すると<br />
          あなたの「アーキタイプ」と「防衛機制の傾向」がここに分析・出力されます。<br />
          （現在: <strong>{pendingCount} / 3</strong> 件蓄積済み）
        </p>
      </div>
    );
  }

  const { shadow, shadowDescription, primaryDefense, defenseDescription } = latestAnalysis.result;

  return (
    <div className="dream-analyzer-container">
      <h1 className="deep-analysis-header">深層分析結果</h1>

      {/* メイン分析カード */}
      <div className="deep-analysis-card">
        {/* 上段：シャドウ */}
        <div className="deep-shadow-section">
          <h2 className="deep-section-title">現在のアーキタイプ</h2>
          <div className="deep-shadow-content">
            <div className="deep-shadow-name">{shadow}</div>
            <div className="deep-shadow-desc">{shadowDescription}</div>
          </div>
        </div>

        {/* 下段：防衛機制レーダーチャート＋解説 */}
        <div className="deep-defense-section">
          <div className="deep-chart-container" style={{ width: "100%", height: 300 }}>
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
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="deep-defense-info">
            <div className="deep-defense-title">優位な防衛機制：{primaryDefense}</div>
            <div className="deep-defense-desc">{defenseDescription}</div>
          </div>
        </div>
      </div>

      {/* 過去5回分の推移グラフ（履歴が2回以上ある場合に自動表示） */}
      {transitionData.length >= 2 && (
        <div className="deep-analysis-card" style={{ marginTop: "40px" }}>
          <h2 className="deep-section-title">防衛機制の移り変わり（過去{transitionData.length}回の推移）</h2>
          <div style={{ width: "100%", height: 300, marginTop: "20px" }}>
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
                <Line type="monotone" dataKey="repression" name="抑圧" stroke="#b8d4f5" strokeWidth={2} />
                <Line type="monotone" dataKey="reactionFormation" name="反動形成" stroke="#c8aee8" strokeWidth={2} />
                <Line type="monotone" dataKey="displacement" name="置き換え" stroke="#ffd180" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}