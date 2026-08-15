import { useState, useEffect } from "react";

const STORAGE_KEY_PENDING = "dream_art_pending_sessions";
const STORAGE_KEY_HISTORY = "dream_art_deep_history";

export function useDeepAnalysisStorage() {
  const [pendingSessions, setPendingSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PENDING);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deepHistory, setDeepHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(pendingSessions));
  }, [pendingSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(deepHistory));
  }, [deepHistory]);

  // 1回分の「夢＋内省データ」を追加し、3件に達したら即座に深層分析を実行
  const addSession = async (dreamData) => {
    const newSession = {
      ...dreamData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const nextPending = [...pendingSessions, newSession];
    
    // 💡 3件溜まった場合
    if (nextPending.length >= 3) {
      setPendingSessions([]); // 蓄積用をクリア
      await executeDeepAnalysis(nextPending.slice(0, 3));
    } else {
      setPendingSessions(nextPending);
    }
  };

const executeDeepAnalysis = async (sessionsToAnalyze) => {
    setIsAnalyzing(true);

    try {
      const response = await fetch("http://localhost:5000/api/deep-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions: sessionsToAnalyze }),
      });

      if (!response.ok) {
        throw new Error(`API Error Status: ${response.status}`);
      }

      const resJson = await response.json();
      
      // 💡 データの入れ子構造を確実に解体して取得
      const resultData = resJson.data || resJson;

      console.log("【APIからの生の分析結果】:", resultData);

      // 万が一スコアのキーが日本語で返ってきた場合への安全なマッピング補正
      const scores = resultData.defenseScores || {};
      const normalizedScores = {
        rationalization: scores.rationalization ?? scores["合理化"] ?? 50,
        repression: scores.repression ?? scores["抑圧"] ?? 40,
        reactionFormation: scores.reactionFormation ?? scores["反動形成"] ?? 30,
        displacement: scores.displacement ?? scores["置き換え"] ?? 40,
      };

      const finalResult = {
        shadow: resultData.shadow || "トリックスター",
        shadowDescription: resultData.shadowDescription || "無意識下の欲求が既存の規範と摩擦を起こしています。",
        primaryDefense: resultData.primaryDefense || "抑圧",
        defenseDescription: resultData.defenseDescription || "言いたいことや不都合な感情を内側に押し込める傾向が見られます。",
        defenseScores: normalizedScores
      };

      const newHistoryItem = {
        id: Date.now().toString(),
        analyzedAt: new Date().toISOString(),
        result: finalResult,
        sessions: sessionsToAnalyze,
      };

      setDeepHistory((prev) => [newHistoryItem, ...prev].slice(0, 5));
    } catch (err) {
      console.error("深層分析API通信エラー:", err);
      
      // 通信が完全に切れている場合のみのフォールバック（※固定化を避けるためダミーも変化させます）
      const dummyShadows = ["トリックスター", "賢者", "アニマ", "破壊者", "孤児"];
      const randomShadow = dummyShadows[Math.floor(Math.random() * dummyShadows.length)];

      const fallbackItem = {
        id: Date.now().toString(),
        analyzedAt: new Date().toISOString(),
        result: {
          shadow: randomShadow,
          shadowDescription: "【オフライン試行】無意識の感情と顕在意識の思考にズレが生じています。",
          primaryDefense: "抑圧",
          defenseDescription: "不都合な感情を意識下へ押し込める傾向が一時的に強まっています。",
          defenseScores: {
            rationalization: 40,
            repression: 80,
            reactionFormation: 30,
            displacement: 50
          }
        },
        sessions: sessionsToAnalyze,
      };

      setDeepHistory((prev) => [fallbackItem, ...prev].slice(0, 5));
    } finally {
      setIsAnalyzing(false);
    }
  };


  return {
    pendingSessions,
    pendingCount: pendingSessions.length,
    deepHistory,
    latestAnalysis: deepHistory[0] || null, // 最新の1件を常に返却
    isAnalyzing,
    addSession,
  };
}