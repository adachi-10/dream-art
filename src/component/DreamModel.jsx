import { useEffect, useRef, useMemo } from "react";


const MODEL_ASSETS = {
  "死": {
    video: "/video/death.mp4",
    audio: "/audio/death-bgm.mp3"  
  },
  "欲望": {
    video: "/video/want.mp4",
    audio: "/audio/want-bgm.mp3"  
  },
  "生": {
    video: "/video/human.mp4",
    audio: "/audio/human-bgm.mp3"   
  }
};

export default function DreamModel({ modelKey }) {
  // 現在のモデルに応じたアセット（動画・音声）を取得
  const assets = useMemo(() => {
    return MODEL_ASSETS[modelKey] || MODEL_ASSETS["人"];
  }, [modelKey]);

  const audioRef = useRef(null);

  useEffect(() => {
    // 💡 2. 動画が表示された瞬間に、そのモデル専用のBGMを生成
    const audio = new Audio(assets.audio);
    audio.loop = true;   // ループ再生ON
    audio.volume = 0.4;  // 音量（40%）
    audioRef.current = audio;


    const playAudio = () => {
      audio.play().catch(err => {
        console.log("ブラウザの自動再生制限による保留（ユーザーのアクション後に再生されます）:", err);
      });
    };

    playAudio();

   
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [assets]); 
  return (
    <div className="dream-video-wrapper">
      <video
        key={assets.video} /* 動画切り替え時にプレイヤーを強制リフレッシュ */
        src={assets.video}
        autoPlay
        loop
        muted      
        playsInline
        controls={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}