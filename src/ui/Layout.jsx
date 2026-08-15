// src/components/Layout.jsx
import "../styles/Layout.css";

export default function Layout({ children, onPageChange }) {
  return (
    <div className="layout">
      {/* ナビゲーション */}
      <nav className="nav">
        <span className="nav__logo">DreamArt</span>
        <ul className="nav__links">
          <li>
            <button onClick={() => onPageChange("analyze")} className="nav-btn-link">ホーム</button>
          </li>
          <li>
            <button onClick={() => onPageChange("explanation")} className="nav-btn-link">使い方</button>
          </li>
          <li>
            <button onClick={() => onPageChange("deep")} className="nav-btn-link">深層分析</button>
          </li>
          <li>
            <button onClick={() => onPageChange("collection")} className="nav-btn-link">コレクション</button>
            </li>
        </ul>
      </nav>

      {/* ヒーローセクション */}
      <header className="hero">
        <h1 className="hero__title">Dream Art</h1>
        <p className="hero__sub">
          夢の断片を言葉にして入力してください。AIがあなたの内側にある感情読み解き、深層心理が3Dアートに変換されます 毎日の夢は履歴に残るので、回数を重ねることで自己内省を深めることができます
        </p>

        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <img src="/アイコン.png" alt="" style={{ width: "180px", opacity: 0.95 }} />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="main">
        {children}
      </main>

      <style>{`
        .nav-btn-link {
          background: none;
          border: none;
          color: white;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          padding: 5px 10px;
          transition: opacity 0.2s;
        }
        .nav-btn-link:hover {
          opacity: 0.7;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}