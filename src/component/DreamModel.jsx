import Spline from '@splinetool/react-spline';
import { useMemo } from 'react';

// ✅ キーワードとSplineのURLのマッピング
const SPLINE_SCENES = {
  "死": "https://prod.spline.design/hXabt3zJlt79xMb2/scene.splinecode", // 例：死のモデルURL
  "生": "https://prod.spline.design/hXabt3zJlt79xMb2/scene.splinecode", // 準備でき次第URLを変えてください
  "人": "https://prod.spline.design/hXabt3zJlt79xMb2/scene.splinecode",
};

export default function DreamModel({ modelKey }) {
  // modelKey（死、生、人）に基づいてURLを選択
  // まだ1つしかない場合は、すべて同じURLに設定しておけばOKです
  const sceneUrl = useMemo(() => {
    return SPLINE_SCENES[modelKey] || SPLINE_SCENES["人"]; 
  }, [modelKey]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      minHeight: '250px', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      overflow: 'hidden',
      borderRadius: '12px'
    }}>
      {/* Spline本体 */}
      <Spline 
        scene={sceneUrl} 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}