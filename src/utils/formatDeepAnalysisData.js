/**
 * 1. レーダーチャートライブラリ（Recharts等）が受け取れる配列データへ変換
 */
export function formatRadarChartData(defenseScores) {
  if (!defenseScores) return [];

  const labels = {
    rationalization: "合理化",
    repression: "投影",
    reactionFormation: "反動形成",
    displacement: "逃避",
  };

  return Object.keys(labels).map((key) => ({
    subject: labels[key],
    score: defenseScores[key] || 0,
    fullMark: 100,
  }));
}

/**
 * 2. 過去5回分の深層分析履歴から「心理的な移り変わり（推移）」を追跡するためのデータ整形
 */
export function formatHistoryTransitionData(deepHistory) {
  if (!Array.isArray(deepHistory) || deepHistory.length === 0) return [];

  // 古い順に並び替えて時系列グラフに流し込めるようにする
  return [...deepHistory].reverse().map((item, index) => {
    const date = new Date(item.analyzedAt);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    return {
      index: index + 1,
      label: `第${index + 1}期 (${dateStr})`,
      shadow: item.result.shadow,
      primaryDefense: item.result.primaryDefense,
      rationalization: item.result.defenseScores.rationalization,
      repression: item.result.defenseScores.repression,
      reactionFormation: item.result.defenseScores.reactionFormation,
      displacement: item.result.defenseScores.displacement,
    };
  });
}