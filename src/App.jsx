import { useState } from "react";
import DreamAnalyzer from "./component/DreamAnalyzer.jsx";
import Layout from "./ui/Layout.jsx";


function App() {
  const [currentModel, setCurrentModel] = useState(null);
  
  // ★ 現在表示している画面の状態 ("analyze" か "history")
  const [viewMode, setViewMode] = useState("analyze");

  return (
    <div>
      {/* 1. Layout に関数を渡す */}
      <Layout onPageChange={(page) => setViewMode(page)}>
        
        {/* 2. 履歴モード ("history") のときだけ表示を切り替える */}
        {viewMode === "history" ? (
          /* ここに履歴表示専用のコンポーネントを置くか、
             DreamAnalyzerを「履歴モード」で呼び出す */
          <DreamAnalyzer 
            currentModelKey={currentModel} 
            showHistoryOnly={true} // ★履歴モードフラグを渡す（前回提示したDreamAnalyzerの修正）
          />
        ) : (
          /* 通常の分析モード ("analyze") */
          <DreamAnalyzer 
            onAnalyzeSuccess={(key) => setCurrentModel(key)} 
            currentModelKey={currentModel}
            showHistoryOnly={false}
          />
        )}

      </Layout>
    </div>
  );
}

export default App;