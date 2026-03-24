import "../styles/Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout">

      {/* ナビゲーション */}
      <nav className="nav">
        <span className="nav__logo">DreamArt</span>
        <ul className="nav__links">
          <li><a href="#">ホーム</a></li>
          <li><a href="#">使い方</a></li>
          <li><a href="#">履歴</a></li>
        </ul>
      </nav>

      {/* ヒーロー（タイトル・サブタイトル） */}
      <header className="hero">
        <h1 className="hero__title">ゆめをアートで可視化する</h1>
        <p className="hero__sub">
          夢の断片をことばにして、AIがあなたの内側にある感情を3Dアートに変換します
        </p>

<div
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: "20px"
  }}
>
  <img
    src="/アイコン.png"
    alt=""
    style={{
      width: "180px",
      opacity: 0.95
    }}
  />
</div>


        
      </header>

      {/* メインコンテンツ（DreamAnalyzerなどが入る） */}



      <main className="main">
        {children}
      </main>


    </div>
  );
}
