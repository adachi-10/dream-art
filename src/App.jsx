import { useState } from "react";
import DreamAnalyzer from "./component/DreamAnalyzer.jsx";
import Layout from "./ui/Layout.jsx";

function App() {
  // 分析結果（キーワード）を保持するState
  const [currentModel, setCurrentModel] = useState(null);

  return (
    // position: relative などを削除し、以前のシンプルな形に
    <div>
      <Layout />
      {/* onAnalyzeSuccessを渡して結果を受け取り、モデル表示用にDreamAnalyzerへ渡す */}
      <DreamAnalyzer 
        onAnalyzeSuccess={(key) => setCurrentModel(key)} 
        currentModelKey={currentModel} // ★ここを追記（後述のDreamAnalyzerで使用）
      />
    </div>
  );
}

export default App;
