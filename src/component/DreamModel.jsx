import { useEffect, useRef } from "react";

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
  },
  "社交": {
    video: "/video/social.mp4",
    audio: "/audio/social.mp3"   
  },
  "自由": {
    video: "/video/freedom.mp4",
    audio: "/audio/freedom.mp3"   
  },
  "恐怖": {
    video: "/video/fear.mp4",
    audio: "/audio/fear.mp3"   
  }
};

export default function DreamModel({ modelKey }) {
  // 💡 1. useMemoを使わず、定数オブジェクトを直接参照することで参照が変わるバグを防止
  // 💡 2. 存在しないキーの場合のフォールバックを "人" ではなく "生" に修正
  const targetKey = MODEL_ASSETS[modelKey] ? modelKey : "生";
  const assets = MODEL_ASSETS[targetKey];

  const audioRef = useRef(null);

  useEffect(() => {
    // 💡 modelKeyが変わらない限り、このuseEffectは1回しか走らなくなります
    const audio = new Audio(assets.audio);
    audio.loop = true;   // ループ再生ON
    audio.volume = 0.4;  // 音量（40%）
    audioRef.current = audio;

    const playAudio = () => {
      audio.play().catch(err => {
        console.log("自動再生制限による保留:", err);
      });
    };

    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [targetKey]); // 👈 依存配列を「文字列(targetKey)」にすることで、文字入力時の再発火を100%遮断

  return (
    <div className="dream-video-wrapper">
      <video
        key={assets.video} /* 動画ファイル自体が変わった時だけリフレッシュ */
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