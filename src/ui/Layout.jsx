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
          ～夢から始まる自己分析～<br />
          夢の内容を入力してください。AIがあなたの内側にある感情を読み解き、深層心理が3Dアートに変換されます。
          （※「夢を分析する」を押すと音が流れます。）
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