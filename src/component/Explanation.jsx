import React from "react";
import "../styles/Explanation.css";

export default function Explanation() {
  return (
    <div className="explanation-container">
      {/* 💡 h2: ネイビー色のメインタイトル */}
      <h2 className="explanation-main-title">使い方説明</h2>

      {/* 💡 1. 使い方説明ブロック（すりガラス囲み） */}
      <div className="explanation-glass-card explanation-section-spacing">
        {/* 1. 夢分析 */}
        <div className="explanation-item">
          <div className="explanation-text-area">
            <h3 className="explanation-step-title">１ 夢分析</h3>
            <h4 className="explanation-step-desc">
              夢の記憶を言葉にすることで分析が開始され、あなたの深層心理が3Dアートとして表現されます。夢の中に抑圧された無意識の叫びがあるという考えをもとにしたユングの夢分析方法を参考にしています。
            </h4>
          </div>
          {/* 右端：1920x1080 (16:9) 画像差し込み枠 */}
          <div className="explanation-image-box">
            <img 
              src="/images/explanation-dream.png" 
              alt="夢分析のイメージ図" 
              onError={(e) => {
                // 画像が未配置の場合はプレースホルダーを表示
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* 2. 深層分析 */}
        <div className="explanation-item" style={{ marginTop: "32px", paddingTop: "32px", borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
          <div className="explanation-text-area">
            <h3 className="explanation-step-title">２ 深層分析</h3>
            <h4 className="explanation-step-desc">
              結果と共に出てくる二つの質問に答えることでよりあなたの輪郭を明確にする深層分析が解放されます。分析は３回質問に答えるごとに行われ、分析結果は５回まで内容が保持されます。
            </h4>
          </div>
          {/* 右端：1920x1080 (16:9) 画像差し込み枠 */}
          <div className="explanation-image-box">
            <img 
              src="/images/explanation-deep.png" 
              alt="深層分析のイメージ図" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* 💡 2. 用語解説ブロック（すりガラス囲み・画面下部） */}
      <div className="explanation-glass-card">
        <h3 className="glossary-card-title">用語解説</h3>
        <div className="glossary-list">
          <h3 className="glossary-item-text">
            <span className="glossary-term">シャドウ：</span>
            ユングが提唱した、無意識に抑圧された自我のこと。認めたくない自分の一面でもあり、それを他者に見出すと嫌悪感を感じてしまう
          </h3>

          <h3 className="glossary-item-text">
            <span className="glossary-term">ペルソナ：</span>
            ユングが提唱した、人が社会生活を送るために後天的に身に着けた人格のこと。人格は一つだけでなく、場面や人に応じて複数あることがめずらしくない
          </h3>

          <h3 className="glossary-item-text">
            <span className="glossary-term">アニマ・アニムス：</span>
            ユングが提唱した、男性の心の中にある女性的な部分をアニマ、女性の心の中にある男性的な部分をアニムスという
          </h3>
        </div>
      </div>
    </div>
  );
}