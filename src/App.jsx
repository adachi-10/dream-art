import { useState, useEffect } from "react";
import DreamAnalyzer from "./component/DreamAnalyzer.jsx";
import Collection from "./component/Collection.jsx";
import Layout from "./ui/Layout.jsx";
import Explanation from "./component/Explanation.jsx";

// renderContent 内の switch 文


function App() {
  const [currentModel, setCurrentModel] = useState(null);
  const [viewMode, setViewMode] = useState("analyze");

  // 💡 解放済みモデルのステートを App.jsx で一括管理
  const [unlockedKeys, setUnlockedKeys] = useState(() => {
    try {
      const saved = localStorage.getItem("dream_art_unlocked_models");
      return saved ? JSON.parse(saved).flat(Infinity) : ["生"];
    } catch {
      return ["生"];
    }
  });

  // 💡 夢分析で新しいキーが解放された時に呼ばれる関数
  const handleUnlockModel = (newKeys) => {
    if (!newKeys || newKeys.length === 0) return;
    const targetKey = newKeys[0];

    setUnlockedKeys((prev) => {
      if (prev.includes(targetKey)) return prev;
      const updated = [...prev, targetKey];
      localStorage.setItem("dream_art_unlocked_models", JSON.stringify(updated));
      return updated;
    });
  };

  const renderContent = () => {
    switch (viewMode) {
      case "collection":
        // 💡 最新の unlockedKeys を Collection に渡す
        return <Collection unlockedKeys={unlockedKeys} />;

      case "history":
        return (
          <DreamAnalyzer 
            currentModelKey={currentModel}
            showHistoryOnly={true}
            activeTab="history"
          />
        );

      case "deep":
        return (
          <DreamAnalyzer 
            currentModelKey={currentModel}
            showHistoryOnly={false}
            activeTab="deep"
          />
        );

        case "explanation":
  return <Explanation />;

      case "analyze":
      default:
        return (
          <DreamAnalyzer 
            onAnalyzeSuccess={(keys) => {
              setCurrentModel(keys);
              handleUnlockModel(keys); // 💡 分析成功時にコレクションも更新
            }} 
            currentModelKey={currentModel}
            showHistoryOnly={false}
            activeTab="analyze"
          />
        );
    }
  };

  return (
    <div>
      <Layout onPageChange={(page) => setViewMode(page)}>
        {renderContent()}
      </Layout>
    </div>
  );
}

export default App;